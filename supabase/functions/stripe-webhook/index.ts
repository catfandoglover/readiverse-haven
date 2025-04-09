import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
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
    console.log(`Event ID: ${event.id}`);
    console.log(`Event Created: ${new Date(event.created * 1000).toISOString()}`);

    // Handle the event based on its type
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Check if this is a subscription checkout
      if (session.mode === 'subscription') {
        console.log('Subscription checkout completed:', session.id);
        
        try {
          // Get the subscription from the session
          const subscriptionId = session.subscription;
          
          if (!subscriptionId) {
            throw new Error('No subscription ID found in checkout session');
          }
          
          // Get user ID from metadata
          const userId = session.metadata?.user_id;
          const planType = session.metadata?.plan_type || 'surge';
          
          if (!userId) {
            throw new Error('No user ID found in checkout session metadata');
          }
          
          console.log(`Subscription created for user ${userId}, plan ${planType}, subscription ID ${subscriptionId}`);
          
          // Get the subscription to get customer ID
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const stripeCustomerId = subscription.customer;
          
          console.log(`Got customer ID from subscription: ${stripeCustomerId}`);
          
          // Check if customer record exists
          const { data: existingCustomer, error: customerCheckError } = await supabaseClient
            .from('customers')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (customerCheckError && customerCheckError.code !== 'PGRST116') {
            throw new Error(`Error checking customer: ${customerCheckError.message}`);
          }
          
          // If customer record doesn't exist, create it. Otherwise update it.
          const operation = !existingCustomer ? 'insert' : 'update';
          
          const customerData = {
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            subscription_status: 'active',
            subscription_tier: planType,
            updated_at: new Date().toISOString()
          };
          
          // If inserting, add created_at field
          if (operation === 'insert') {
            customerData.created_at = new Date().toISOString();
            customerData.email = session.customer_details?.email || 'unknown@example.com';
          }
          
          // Upsert the customer record
          const { error: updateError } = await supabaseClient
            .from('customers')
            .upsert(customerData);
            
          if (updateError) {
            console.error('Error updating customer record:', updateError);
          } else {
            console.log(`Customer record ${operation}d for user ${userId}`);
          }
        } catch (error) {
          console.error('Error handling subscription checkout:', error);
        }
      } 
      // Handle regular (non-subscription) checkout.session.completed events
      else if (session.payment_status === 'paid') {
        try {
          console.log("Payment successful, creating booking in TidyCal");
          
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
          
          // Store the booking record in a new bookings table
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
        } catch (error) {
          console.error("Error processing successful payment:", error);
          // We still return 200 to Stripe so they don't retry the webhook
          // But log the error for debugging
        }
      }
    }

    // Extended subscription handling for all subscription-related events
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.paused',
      'customer.subscription.resumed',
      'customer.subscription.pending_update_applied',
      'customer.subscription.pending_update_expired',
      'customer.subscription.trial_will_end'
    ];
    
    if (subscriptionEvents.includes(event.type)) {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;
      const subscriptionId = subscription.id;
      
      console.log(`Processing subscription event: ${event.type}`);
      console.log(`Subscription ID: ${subscriptionId}`);
      console.log(`Customer ID: ${customerId}`);
      console.log(`Status: ${status}`);
      
      try {
        // Find the user ID for this customer
        const { data: customers, error: customerError } = await supabaseClient
          .from('customers')
          .select('user_id, subscription_status')
          .eq('stripe_customer_id', customerId)
          .limit(1);
          
        if (customerError) {
          throw new Error(`Error retrieving customer: ${customerError.message}`);
        }
          
        if (!customers || customers.length === 0) {
          console.log(`No customer found in database for Stripe ID: ${customerId}`);
          
          // Try to get customer details from Stripe
          const stripeCustomer = await stripe.customers.retrieve(customerId);
          console.log(`Retrieved Stripe customer: ${JSON.stringify(stripeCustomer)}`);
          
          if (stripeCustomer.deleted) {
            console.log(`Stripe customer ${customerId} is deleted, skipping`);
            return new Response(JSON.stringify({ received: true }), { 
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
          
          // Since we don't have the user_id mapping, we'll log this situation
          console.log(`IMPORTANT: Customer ${customerId} exists in Stripe but not in our database`);
          console.log(`This may require manual intervention to identify the user`);
          
          return new Response(JSON.stringify({ received: true, warning: 'Customer not found in database' }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        const userId = customers[0].user_id;
        console.log(`Found user ID in database: ${userId}`);
        
        // Determine if this is a status change
        const isStatusChange = customers[0].subscription_status !== status;
        if (isStatusChange) {
          console.log(`Status change detected: ${customers[0].subscription_status} → ${status}`);
        }
        
        // Determine the plan type from the subscription items
        let planType = 'surge'; // Default to surge plan
        
        // Get the price and product ID from the subscription
        if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const productId = subscription.items.data[0].price.product;
          console.log(`Subscription price ID: ${priceId}`);
          console.log(`Subscription product ID: ${productId}`);
        }
        
        // Special handling for cancelled/deleted subscriptions
        let subscriptionTier = planType;
        if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(status)) {
          subscriptionTier = 'free';
          console.log(`Setting tier to 'free' because status is ${status}`);
        }
        
        // Only update the database if status is changing or it's a creation event
        if (isStatusChange || event.type === 'customer.subscription.created') {
          // Update customer subscription status in database
          const { error: updateError } = await supabaseClient
            .from('customers')
            .update({
              subscription_status: status,
              subscription_tier: subscriptionTier,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            throw new Error(`Failed to update customer record: ${updateError.message}`);
          }
          
          console.log(`Updated subscription status to ${status} and tier to ${subscriptionTier} for user ${userId}`);
        } else {
          console.log(`No status change, skipping database update`);
        }
      } catch (error) {
        console.error(`Error processing subscription event: ${error.message}`);
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
