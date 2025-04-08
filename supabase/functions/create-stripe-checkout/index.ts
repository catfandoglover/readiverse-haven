
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { promoCode } = await req.json();
    
    // Get auth token from request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate auth token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }
    
    const user = userData.user;
    console.log(`Creating checkout session for user: ${user.id}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer record
    let customerId;
    const { data: customerData } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id;
      console.log(`Found existing Stripe customer: ${customerId}`);
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
      console.log(`Created new Stripe customer: ${customerId}`);
      
      // Save customer ID in Supabase
      await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          email: user.email
        });
    }
    
    // Handle promo code if provided
    let discountPercent = 0;
    let promoCodeId = null;
    
    if (promoCode) {
      console.log(`Validating promo code: ${promoCode}`);
      const { data: promoData, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode)
        .eq("active", true)
        .single();
      
      if (promoError) {
        console.log(`Invalid promo code: ${promoCode}`);
      } else if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        console.log(`Expired promo code: ${promoCode}`);
      } else if (promoData.max_uses && promoData.current_uses >= promoData.max_uses) {
        console.log(`Promo code usage limit reached: ${promoCode}`);
      } else {
        // Valid promo code
        discountPercent = promoData.discount_percent;
        promoCodeId = promoData.id;
        console.log(`Valid promo code with ${discountPercent}% discount`);
      }
    }
    
    // Calculate price based on discount
    const basePrice = 899; // $8.99 per month
    const discountedPrice = Math.max(1, Math.round(basePrice * (100 - discountPercent) / 100));
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SURGE Subscription",
              description: "Unlimited Virgil chat and advanced features",
            },
            unit_amount: discountedPrice,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/profile/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/profile/settings`,
      metadata: {
        user_id: user.id,
        promo_code_id: promoCodeId || "",
        discount_percent: discountPercent.toString()
      }
    });

    console.log(`Created checkout session: ${session.id}`);
    
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error creating checkout session: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
