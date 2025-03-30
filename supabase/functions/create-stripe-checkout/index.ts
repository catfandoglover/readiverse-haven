
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { corsHeaders } from "../_shared/cors.ts";

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

    // Store the booking data in the metadata so we can retrieve it in the webhook
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
            unit_amount: 9900, // $99.00 in cents
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
