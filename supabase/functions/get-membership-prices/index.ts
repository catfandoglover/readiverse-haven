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

// Default fallback pricing
const DEFAULT_PRICING = {
  monthly: {
    id: SURGE_PLAN_ID,
    price: 20
  },
  annual: {
    id: SURGE_PLAN_ID,
    price: 169
  }
};

serve(async (req) => {
  // Handle CORS preflight requests exactly like the working function
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
          price: data.monthly_cost || DEFAULT_PRICING.monthly.price
        },
        annual: {
          id: SURGE_PLAN_ID,
          price: data.yearly_cost || DEFAULT_PRICING.annual.price
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