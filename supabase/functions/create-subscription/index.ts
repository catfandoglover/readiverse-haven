
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
    const { price_id, billing_interval } = await req.json();
    
    if (!price_id) {
      throw new Error("Price ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }
    
    const user = userData.user;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user has an existing Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId;
    
    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id;
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save the customer ID in the database
      await supabaseClient.from("customers").insert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscription_status: "inactive",
        subscription_tier: "free",
      });
    }

    // Get the appropriate price ID based on billing interval
    const lookupPriceId = billing_interval === 'annual' 
      ? '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a'  // Annual billing
      : 'fe95c5c4-2246-4d99-915b-06655ca6fcce'; // Monthly billing
    
    // Get the actual Stripe price ID from the revenue_items table
    const { data: priceData, error: priceError } = await supabaseClient
      .from("revenue_items")
      .select("purpose")  // purpose field contains the Stripe price ID
      .eq("id", lookupPriceId)
      .single();
    
    if (priceError || !priceData?.purpose) {
      throw new Error("Price not found");
    }

    const stripePriceId = priceData.purpose;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/profile-settings?subscription_success=true`,
      cancel_url: `${req.headers.get("origin")}/profile-settings?subscription_cancelled=true`,
      allow_promotion_codes: true, // Enable promo codes
      client_reference_id: user.id,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Subscription error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
