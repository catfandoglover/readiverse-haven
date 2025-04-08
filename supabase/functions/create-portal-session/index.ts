
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
    console.log("Portal session request received");
    console.log(`Authorization header present: ${req.headers.has("Authorization")}`);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user...");
    
    // Using getUser() instead of relying on the session
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("Authentication error:", userError);
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

    // Find the customer in our database
    console.log(`Looking up Stripe customer for user ${user.id}`);
    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      console.error("Error fetching customer:", customerError);
      throw new Error(`Error fetching customer data: ${customerError.message}`);
    }

    if (!customerData?.stripe_customer_id) {
      console.error("No customer record found");
      throw new Error("Customer not found - please subscribe first");
    }

    console.log(`Found customer: ${customerData.stripe_customer_id}`);

    // Create a billing portal session
    console.log("Creating Stripe portal session...");
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerData.stripe_customer_id,
        return_url: `${req.headers.get("origin")}/profile-settings`,
      });

      console.log(`Portal session created: ${session.id}, URL: ${session.url}`);

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe portal session creation error:", stripeError);
      throw new Error(`Stripe portal error: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Portal session error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
