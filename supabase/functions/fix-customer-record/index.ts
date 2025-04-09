import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const body = await req.json();
    const { userId, email, stripeCustomerId } = body;
    
    if (!userId) {
      throw new Error("Missing user ID");
    }
    
    console.log(`Fixing customer record for user ${userId}`);

    // First check if a record exists
    const { data: existingCustomer, error: fetchError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      // If error is not "no rows returned", it's a real error
      throw fetchError;
    }
    
    const customerData = {
      user_id: userId,
      email: email || (existingCustomer?.email || 'customer@example.com'),
      stripe_customer_id: stripeCustomerId || (existingCustomer?.stripe_customer_id || `temp_${userId}`),
      subscription_status: 'active',
      subscription_tier: 'surge',
      updated_at: new Date().toISOString()
    };
    
    if (!existingCustomer) {
      customerData.created_at = new Date().toISOString();
    }
    
    // Upsert the customer record (update if exists, insert if not)
    const { data, error } = await supabaseClient
      .from('customers')
      .upsert(customerData)
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log("Successfully updated customer record:", data);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Customer record updated with surge subscription",
        data
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, 
      }
    );
  } catch (error) {
    console.error("Error fixing customer record:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An error occurred fixing the customer record" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, 
      }
    );
  }
}); 