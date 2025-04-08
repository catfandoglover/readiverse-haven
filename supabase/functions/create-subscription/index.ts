
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
    // Log request information
    console.log(`Request received with method: ${req.method}`);
    console.log(`Authorization header present: ${req.headers.has("Authorization")}`);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log(`Request body: ${JSON.stringify(body, null, 2)}`);
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body");
    }
    
    const { price_id, billing_interval } = body;
    
    if (!price_id) {
      throw new Error("Price ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token received, authenticating user...");
    
    // Get the user from the auth header
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("Auth error:", userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!userData?.user) {
      console.error("No user data returned");
      throw new Error("User not found");
    }
    
    const user = userData.user;
    console.log(`User authenticated: ${user.id}, Email: ${user.email}`);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Stripe secret key not configured");
      throw new Error("Stripe configuration error");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if user has an existing Stripe customer ID
    console.log(`Looking for customer record for user: ${user.id}`);
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
      try {
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
      } catch (stripeError) {
        console.error("Stripe customer creation error:", stripeError);
        throw new Error(`Stripe error: ${stripeError.message}`);
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
    try {
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
    } catch (stripeError) {
      console.error("Stripe checkout session creation error:", stripeError);
      throw new Error(`Stripe checkout error: ${stripeError.message}`);
    }
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
