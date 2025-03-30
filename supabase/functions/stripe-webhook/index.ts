
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

    // Handle the event based on its type
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Make sure payment is successful
      if (session.payment_status === 'paid') {
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

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
