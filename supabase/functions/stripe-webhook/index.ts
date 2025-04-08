
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Webhook signature missing", { status: 400 });
  }

  try {
    // Get request body as text for verification
    const body = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Handle both subscription and one-time payments
        if (session.mode === 'subscription') {
          await handleSuccessfulSubscription(session);
        } else if (session.mode === 'payment' && session.payment_status === 'paid') {
          // Handle booking creation for one-time payments
          await handleSuccessfulBooking(session);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await updateSubscriptionStatus(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleCancelledSubscription(subscription);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

// Handle successful subscription checkout
async function handleSuccessfulSubscription(session) {
  // Find the customer in our database
  if (session.client_reference_id) {
    try {
      const { data: customer, error } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('user_id', session.client_reference_id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (customer) {
        // Get subscription details from Stripe
        const subscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Determine subscription tier based on product
        const productId = subscription.items.data[0].price.product;
        const product = await stripe.products.retrieve(productId);
        const subscriptionTier = product.name.toLowerCase().includes('surge') ? 'surge' : 'standard';
        
        // Update customer record with subscription info
        await supabaseClient
          .from('customers')
          .update({
            subscription_status: subscription.status,
            subscription_tier: subscriptionTier,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.client_reference_id);
      }
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  }
}

// Handle subscription status updates
async function updateSubscriptionStatus(subscription) {
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Retrieve customer from database
    const { data: customers, error } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('stripe_customer_id', customerId);
      
    if (error) throw error;
    
    if (customers && customers.length > 0) {
      // Determine subscription tier based on product
      const productId = subscription.items.data[0].price.product;
      const product = await stripe.products.retrieve(productId);
      const subscriptionTier = product.name.toLowerCase().includes('surge') ? 'surge' : 'standard';
      
      // Update all customer records with this Stripe customer ID
      for (const customer of customers) {
        await supabaseClient
          .from('customers')
          .update({
            subscription_status: subscription.status,
            subscription_tier: subscriptionTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id);
      }
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
}

// Handle cancelled subscriptions
async function handleCancelledSubscription(subscription) {
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Update customer record in database
    await supabaseClient
      .from('customers')
      .update({
        subscription_status: 'canceled',
        subscription_tier: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId);
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}

// Handle successful booking creation
async function handleSuccessfulBooking(session) {
  try {
    // Make sure payment is successful
    if (session.payment_status === 'paid') {
      // Extract booking data from metadata
      const bookingData = JSON.parse(session.metadata.booking_data || "{}");
      
      if (!bookingData || !bookingData.bookingTypeId) {
        throw new Error("Invalid booking data in metadata");
      }

      console.log("Extracted booking data:", JSON.stringify(bookingData));

      // Call the TidyCal API function to create the booking
      const { data: bookingResponse, error } = await supabaseClient.functions.invoke('tidycal-api', {
        body: { 
          path: 'create-booking',
          ...bookingData
        }
      });

      if (error) {
        console.error("Error creating TidyCal booking:", error);
        throw error;
      }

      console.log("TidyCal booking created successfully:", bookingResponse);
      
      // Store the booking record
      try {
        const { data: storedBooking, error: storageError } = await supabaseClient
          .from('bookings')
          .insert({
            stripe_session_id: session.id,
            booking_type_id: bookingData.bookingTypeId,
            name: bookingData.name,
            email: bookingData.email,
            time_slot_id: bookingData.time_slot_id,
            timezone: bookingData.timezone,
            tidycal_booking_id: bookingResponse?.id || null,
            status: 'completed',
            created_at: new Date().toISOString()
          });
          
        if (storageError) {
          console.error("Error storing booking record:", storageError);
        }
      } catch (storageError) {
        console.error("Exception storing booking record:", storageError);
      }
    }
  } catch (error) {
    console.error("Error processing booking payment:", error);
  }
}
