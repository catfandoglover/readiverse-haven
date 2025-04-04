import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { userId, returnUrl } = await req.json();
    
    if (!userId || !returnUrl) {
      throw new Error("Missing required user information or return URL");
    }

    console.log("Creating Stripe billing portal session for user:", userId);

    // Create a Supabase client to interact with the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the user's email from the profiles table
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    if (userError || !userData?.email) {
      console.error("Error fetching user data:", userError);
      throw new Error("User profile not found");
    }

    const userEmail = userData.email;
    console.log("User email:", userEmail);

    // Search for existing customer in Stripe by email
    let customer;
    
    try {
      console.log("Searching for existing Stripe customer by email:", userEmail);
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log("Found existing Stripe customer:", customer.id);
      } else {
        // Create a new customer in Stripe
        console.log("Creating new Stripe customer for:", userEmail);
        customer = await stripe.customers.create({
          email: userEmail,
          name: userData.full_name || undefined,
          metadata: {
            user_id: userId,
          },
        });
        console.log("Created new Stripe customer:", customer.id);
      }
    } catch (stripeError) {
      console.error("Error with Stripe customer operations:", stripeError);
      throw new Error("Failed to access Stripe customer data");
    }

    // Try to store the customer in our database if we have access
    try {
      console.log("Attempting to store Stripe customer in database");
      const { error: customersError } = await supabaseClient
        .from('customers')
        .upsert({
          user_id: userId,
          email: userEmail,
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (customersError) {
        // Just log the error, don't throw - we can still continue with Stripe
        console.warn("Could not store customer in database:", customersError);
      } else {
        console.log("Successfully stored customer in database");
      }
    } catch (dbError) {
      // Just log and continue - this is not a fatal error
      console.warn("Exception storing customer in database:", dbError);
    }

    // Create a billing portal session
    console.log("Creating customer portal session...");
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    console.log("Session created successfully:", session.id);
    
    return new Response(
      JSON.stringify({ 
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, 
      }
    );
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred creating the billing portal session" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, 
      }
    );
  }
}); 