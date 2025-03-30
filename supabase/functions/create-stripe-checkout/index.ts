
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
    const { bookingData, returnUrl } = await req.json();
    
    if (!bookingData || !returnUrl) {
      throw new Error("Missing required booking information or return URL");
    }

    console.log("Creating Stripe checkout session with data:", {
      bookingType: bookingData.bookingTypeId,
      name: bookingData.name,
      email: bookingData.email,
      timeSlot: bookingData.time_slot_id,
    });

    // Create a Supabase client to fetch the cost
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Fetching booking cost from database...");
    
    // Get the booking cost from the revenue_items table
    const { data: costData, error: costError } = await supabaseClient
      .from('revenue_items')
      .select('cost')
      .eq('id', '50041043-d04b-4826-97bd-83bd3e6bf34e')
      .single();

    // Default to $59.00 if there's an error or no data
    const cost = costError || !costData ? 5900 : Math.round(parseFloat(costData.cost) * 100);
    
    console.log("Using price:", cost, "cents", costError ? "(default - database error)" : "");
    
    // Store the booking data in the metadata so we can retrieve it in the webhook
    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "DNA Assessment Discussion",
              description: "30-minute session with an intellectual genetic counselor",
            },
            unit_amount: cost, // Use the dynamic cost
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${returnUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/book-counselor`,
      metadata: {
        booking_data: JSON.stringify(bookingData),
      },
      customer_email: bookingData.email,
    });

    console.log("Session created:", session.id);
    
    // Record the pending booking in the database
    try {
      const { error: bookingError } = await supabaseClient
        .from('bookings')
        .insert({
          stripe_session_id: session.id,
          booking_type_id: bookingData.bookingTypeId,
          name: bookingData.name,
          email: bookingData.email,
          time_slot_id: bookingData.time_slot_id,
          timezone: bookingData.timezone,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
      if (bookingError) {
        console.error("Error recording pending booking:", bookingError);
      }
    } catch (bookingStoreError) {
      console.error("Exception recording pending booking:", bookingStoreError);
    }
    
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, 
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, 
      }
    );
  }
});
