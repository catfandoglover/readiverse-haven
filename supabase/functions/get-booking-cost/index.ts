
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the booking cost from the revenue_items table
    const { data, error } = await supabaseClient
      .from('revenue_items')
      .select('cost')
      .eq('id', '50041043-d04b-4826-97bd-83bd3e6bf34e')
      .single();

    if (error) {
      console.error('Error fetching booking cost:', error);
      // Return a default fallback cost when the database query fails
      return new Response(
        JSON.stringify({ cost: "59.00" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Return the cost data
    return new Response(
      JSON.stringify({ cost: data.cost }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Exception:', error);
    // Return a default fallback cost when an exception occurs
    return new Response(
      JSON.stringify({ cost: "59.00" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
