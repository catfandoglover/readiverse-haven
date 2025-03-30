
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the booking cost from revenue_items table
    const { data, error } = await supabaseClient
      .from('revenue_items')
      .select('cost')
      .eq('id', '50041043-d04b-4826-97bd-83bd3e6bf34e')
      .single();

    if (error) {
      console.error("Error fetching booking cost:", error);
      throw error;
    }

    // If no data found, return default cost
    if (!data) {
      return new Response(
        JSON.stringify({ 
          cost: "59.00",
          source: "default" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Return the cost from the database
    return new Response(
      JSON.stringify({ 
        cost: data.cost,
        source: "database" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-booking-cost:", error);
    
    // Return default cost when there's an error
    return new Response(
      JSON.stringify({ 
        cost: "59.00", 
        source: "default",
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 to avoid breaking the client
      }
    );
  }
});
