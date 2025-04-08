
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // Initialize Stripe with the webhook secret
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return new Response("Webhook secret missing", { status: 500 });
    }
    
    // Verify Stripe signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Process the event based on type
    console.log(`Processing Stripe event: ${event.type}`);
    
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(session, supabase) {
  console.log("Handling checkout.session.completed");
  
  // Check if session is a subscription
  if (session.mode !== "subscription") {
    console.log("Not a subscription checkout, skipping");
    return;
  }
  
  // If promo code was used, record it
  const promoCodeId = session.metadata?.promo_code_id;
  const userId = session.metadata?.user_id;
  
  if (promoCodeId && userId) {
    console.log(`Recording promo code usage: ${promoCodeId} for user ${userId}`);
    
    try {
      // Record the user-promo code relationship
      await supabase
        .from("user_promo_codes")
        .insert({
          user_id: userId,
          promo_code_id: promoCodeId
        });
      
      // Increment usage counter
      await supabase.rpc("increment_promo_code_usage", { 
        promo_code_id: promoCodeId 
      });
      
      console.log("Successfully recorded promo code usage");
    } catch (error) {
      console.error(`Error recording promo code usage: ${error.message}`);
    }
  }
}

async function handleSubscriptionUpdated(subscription, supabase) {
  console.log(`Handling subscription update: ${subscription.id}, status: ${subscription.status}`);
  
  const customerId = subscription.customer;
  
  // Find the user based on Stripe customer ID
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  
  if (customerError || !customerData) {
    console.error(`Customer not found for Stripe ID: ${customerId}`);
    return;
  }
  
  const userId = customerData.user_id;
  
  // Map Stripe status to our status
  let subscriptionStatus;
  let subscriptionTier = null;
  
  if (subscription.status === "active" || subscription.status === "trialing") {
    subscriptionStatus = "active";
    subscriptionTier = "surge";
  } else if (subscription.status === "past_due") {
    subscriptionStatus = "past_due";
    subscriptionTier = "surge"; // Still give access but flag for payment recovery
  } else if (subscription.status === "unpaid") {
    subscriptionStatus = "unpaid";
    subscriptionTier = null; // No longer has premium access
  } else if (subscription.status === "canceled") {
    subscriptionStatus = "canceled";
    subscriptionTier = null; // No longer has premium access
  } else {
    subscriptionStatus = subscription.status;
    subscriptionTier = null;
  }
  
  // Update customer record
  console.log(`Updating subscription status for user ${userId} to ${subscriptionStatus}, tier: ${subscriptionTier}`);
  
  try {
    await supabase
      .from("customers")
      .update({
        subscription_status: subscriptionStatus,
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    console.log("Successfully updated subscription status");
  } catch (error) {
    console.error(`Error updating subscription status: ${error.message}`);
  }
}

async function handleSubscriptionDeleted(subscription, supabase) {
  console.log(`Handling subscription deletion: ${subscription.id}`);
  
  // Similar to update but explicitly mark as canceled
  const customerId = subscription.customer;
  
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  
  if (customerError || !customerData) {
    console.error(`Customer not found for Stripe ID: ${customerId}`);
    return;
  }
  
  const userId = customerData.user_id;
  
  try {
    await supabase
      .from("customers")
      .update({
        subscription_status: "canceled",
        subscription_tier: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    console.log("Successfully marked subscription as canceled");
  } catch (error) {
    console.error(`Error updating subscription status: ${error.message}`);
  }
}
