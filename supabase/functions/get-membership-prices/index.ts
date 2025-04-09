import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// CORS headers that match the working function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Constants for revenue item IDs
const SURGE_PLAN_ID = '072e9c5b-7ecd-4dd1-9a8f-c7cb58fa028a';

// Stripe price IDs
const STRIPE_MONTHLY_PRICE_ID = Deno.env.get("STRIPE_SURGE_MONTHLY_PRICE_ID") || "price_1RBw2iE88XN52LqVnr33i6xP";
const STRIPE_YEARLY_PRICE_ID = Deno.env.get("STRIPE_SURGE_YEARLY_PRICE_ID") || "price_1RBu1XE88XN52LqVmRNu37w6";

// Default fallback pricing
const DEFAULT_PRICING = {
  monthly: {
    id: SURGE_PLAN_ID,
    price: 20,
    price_id: STRIPE_MONTHLY_PRICE_ID
  },
  annual: {
    id: SURGE_PLAN_ID,
    price: 169,
    price_id: STRIPE_YEARLY_PRICE_ID
  }
};

serve(async (req) => {
  // Handle CORS preflight requests exactly like the working function
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a debug request to get customer data
    const url = new URL(req.url);
    const userId = url.searchParams.get('check_user');
    
    if (userId) {
      console.log("Debug request received for user ID:", userId);
      
      // Create a Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Fetch the customer record to check subscription status
      const { data, error } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log("Customer data for user", userId, ":", data, error);
      
      // For direct access in debug mode, we'll specifically set these CORS headers
      // to allow browser access without auth
      const debugCorsHeaders = {
        ...corsHeaders,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      };
      
      if (error) {
        // Handle the error case
        return new Response(
          JSON.stringify({
            customer: null,
            error: error.message,
            message: `No customer found for user ID: ${userId}`
          }),
          {
            headers: { ...debugCorsHeaders, "Content-Type": "application/json" },
            status: 200, // Still return 200 to avoid CORS issues
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          customer: data,
          error: null,
          message: `Found customer record for user ID: ${userId}`
        }),
        {
          headers: { ...debugCorsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create a Supabase client using the SERVICE_ROLE_KEY like the working function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Fetch the single record that contains both monthly_cost and yearly_cost
    const { data, error } = await supabaseClient
      .from('revenue_items')
      .select('id, monthly_cost, yearly_cost')
      .eq('id', SURGE_PLAN_ID)
      .single();
    
    // Log query result for debugging
    console.log("Query result:", data, error);
    
    if (error || !data) {
      console.error("Database query error:", error);
      return new Response(
        JSON.stringify(DEFAULT_PRICING),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Return the pricing data with CORS headers
    return new Response(
      JSON.stringify({
        monthly: {
          id: SURGE_PLAN_ID,
          price: data.monthly_cost || DEFAULT_PRICING.monthly.price,
          price_id: STRIPE_MONTHLY_PRICE_ID
        },
        annual: {
          id: SURGE_PLAN_ID,
          price: data.yearly_cost || DEFAULT_PRICING.annual.price,
          price_id: STRIPE_YEARLY_PRICE_ID
        },
        source: 'database'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-membership-prices function:", error);
    
    // Return default pricing with CORS headers when there's an error
    return new Response(
      JSON.stringify({
        ...DEFAULT_PRICING,
        source: 'default',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 to avoid breaking the client
      }
    );
  }
}); 