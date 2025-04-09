import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// SURGE plan pricing IDs
const SURGE_MONTHLY_PRICE_ID = Deno.env.get("STRIPE_SURGE_MONTHLY_PRICE_ID") || "price_1RBw2iE88XN52LqVnr33i6xP";
const SURGE_YEARLY_PRICE_ID = Deno.env.get("STRIPE_SURGE_YEARLY_PRICE_ID") || "price_1PD2KDEnKKKQE0SJY2VPfx85";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { userId, userEmail, planType, billingInterval, returnUrl, monthlyPriceId, yearlyPriceId } = await req.json();
    
    // Log the received data
    console.log("Received data:", { userId, userEmail, planType, billingInterval, returnUrl, monthlyPriceId, yearlyPriceId });
    
    if (!userId || !userEmail || !planType || !billingInterval || !returnUrl) {
      const missingFields = [];
      if (!userId) missingFields.push('userId');
      if (!userEmail) missingFields.push('userEmail');
      if (!planType) missingFields.push('planType');
      if (!billingInterval) missingFields.push('billingInterval');
      if (!returnUrl) missingFields.push('returnUrl');
      
      throw new Error(`Missing required information for subscription: ${missingFields.join(', ')}`);
    }

    console.log(`Creating Stripe subscription: ${planType} - ${billingInterval} for user ${userId}`);

    // Create a Supabase client to interact with the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, check if user already exists in Stripe
    const { data: customerData, error: customerError } = await supabaseClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId;
    
    // If customer exists in our database, use their Stripe ID
    if (!customerError && customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id;
      console.log("Found existing Stripe customer:", customerId);
    } else {
      // Otherwise create a new customer in Stripe
      console.log("Creating new customer in Stripe");
      
      // Fetch user profile for better customer data
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();
      
      const customer = await stripe.customers.create({
        email: userEmail,
        name: profileData?.full_name || undefined,
        metadata: {
          user_id: userId,
        },
      });
      
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);
      
      // Store the new customer in our database
      await supabaseClient
        .from('customers')
        .upsert({
          user_id: userId,
          email: userEmail,
          stripe_customer_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    }

    // Determine which price ID to use based on plan and billing interval
    let priceId;
    
    if (planType === 'surge') {
      if (billingInterval === 'yearly' || billingInterval === 'annual') {
        // Use client provided price ID as priority, fall back to env vars
        priceId = yearlyPriceId || SURGE_YEARLY_PRICE_ID;
      } else if (billingInterval === 'monthly') {
        // Use client provided price ID as priority, fall back to env vars
        priceId = monthlyPriceId || SURGE_MONTHLY_PRICE_ID;
      }
    }
    
    console.log("Selected price ID:", priceId);
    
    if (!priceId) {
      console.error("No valid price ID found for", { planType, billingInterval });
      console.error("Price IDs received:", { monthlyPriceId, yearlyPriceId });
      
      // Try to use a direct fallback
      if (billingInterval === 'yearly' || billingInterval === 'annual') {
        priceId = "price_1PD2KDEnKKKQE0SJY2VPfx85"; // Hardcoded fallback for yearly
      } else {
        priceId = "price_1RBw2iE88XN52LqVnr33i6xP"; // Hardcoded fallback for monthly
      }
      
      console.log("Using fallback price ID:", priceId);
    }
    
    // Validate if the price ID appears to be a valid Stripe price ID format
    if (!priceId.startsWith('price_')) {
      console.error("Invalid price ID format:", priceId);
      throw new Error(`Invalid price ID format. Expected Stripe price ID, got: ${priceId}`);
    }

    // Create a Stripe Checkout session for the subscription
    try {
      console.log("Creating Stripe checkout session with:", { 
        customer: customerId, 
        priceId: priceId,
        returnUrl: returnUrl
      });
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl,
        metadata: {
          user_id: userId,
          plan_type: planType
        }
      });

      console.log("Checkout session created:", session.id);
      
      return new Response(
        JSON.stringify({ 
          url: session.url 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, 
        }
      );
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      throw new Error(`Stripe API error: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred creating the subscription" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, 
      }
    );
  }
}); 