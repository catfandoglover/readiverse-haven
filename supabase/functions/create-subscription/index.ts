
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
    
    // Set up logging to help with debugging
    console.log(`Received request with price_id: ${price_id}, billing_interval: ${billing_interval}`);
    
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
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }
    
    const user = userData.user;
    console.log(`User authenticated: ${user.id}`);

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
    
    if (customerError) {
      console.error("Error fetching customer:", customerError);
    }

    let customerId;
    
    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id;
      console.log(`Found existing customer: ${customerId}`);
    } else {
      // Create a new customer in Stripe
      console.log("Creating new Stripe customer...");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      customerId = customer.id;
      console.log(`Created new customer: ${customerId}`);
      
      // Save the customer ID in the database
      const { error: insertError } = await supabaseClient.from("customers").insert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscription_status: "inactive",
        subscription_tier: "free",
      });
      
      if (insertError) {
        console.error("Error inserting customer record:", insertError);
        throw new Error("Failed to create customer record");
      }
    }

    // Direct Stripe price IDs for SURGE subscription
    // Monthly and annual prices for SURGE subscription
    const monthlyPriceId = "price_1Peb2dBRtVcdCm81cbzn1c2Q"; // Monthly price ID
    const annualPriceId = "price_1Peb2dBRtVcdCm81ObCd0nk1"; // Annual price ID
    
    // Determine which price to use based on billing interval
    const stripePriceId = billing_interval === 'annual' ? annualPriceId : monthlyPriceId;
    
    console.log(`Using Stripe price ID: ${stripePriceId}`);

    // Create checkout session
    console.log("Creating checkout session...");
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

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`);
    
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
