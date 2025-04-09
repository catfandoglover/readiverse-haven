import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client with admin privileges
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId, stripeCustomerId } = await req.json();

    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: "Missing Stripe customer ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking subscription status for customer ${stripeCustomerId}, user ${userId}`);

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 10,
    });

    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${stripeCustomerId}`);

    // Check if any active subscription exists
    const isActive = subscriptions.data.length > 0;
    
    // Get subscription details if one exists
    let subscriptionDetails = null;
    if (isActive && subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      
      // Get the plan/price details
      const priceId = subscription.items.data[0]?.price.id;
      const productId = subscription.items.data[0]?.price.product;
      
      subscriptionDetails = {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        priceId: priceId,
        productId: productId
      };
      
      // If subscription is active, update the database record
      try {
        const { error: updateError } = await supabaseClient
          .from('customers')
          .update({
            subscription_status: 'active',
            subscription_tier: 'surge',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error(`Error updating customer record: ${updateError.message}`);
        } else {
          console.log(`Updated customer record for user ${userId} with active subscription`);
        }
      } catch (dbError) {
        console.error(`Exception updating customer record: ${dbError.message}`);
      }
    }

    // Return the result
    return new Response(
      JSON.stringify({
        isActive,
        subscription: subscriptionDetails,
        customerId: stripeCustomerId,
        message: isActive ? "Active subscription found" : "No active subscription found"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error(`Error checking subscription: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}); 