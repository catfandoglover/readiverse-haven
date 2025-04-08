
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenCount, userId } = await req.json();
    
    if (!tokenCount || !userId) {
      throw new Error("Missing required parameters: tokenCount or userId");
    }
    
    if (typeof tokenCount !== 'number' || tokenCount <= 0) {
      throw new Error("Invalid token count");
    }
    
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    console.log(`Tracking ${tokenCount} tokens for user ${userId} in month ${monthYear}`);
    
    // Check if an entry exists for this user and month
    const { data: existingEntry, error: lookupError } = await supabase
      .from("token_usage")
      .select("id, tokens_used")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .maybeSingle();
    
    if (lookupError) {
      console.error(`Error looking up token usage: ${lookupError.message}`);
      throw lookupError;
    }
    
    let result;
    
    if (existingEntry) {
      // Update existing entry
      const newTotal = existingEntry.tokens_used + tokenCount;
      console.log(`Updating existing entry: ${existingEntry.id}, new total: ${newTotal}`);
      
      const { data, error: updateError } = await supabase
        .from("token_usage")
        .update({ 
          tokens_used: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingEntry.id)
        .select()
        .single();
      
      if (updateError) {
        console.error(`Error updating token usage: ${updateError.message}`);
        throw updateError;
      }
      
      result = data;
    } else {
      // Create new entry
      console.log(`Creating new token usage entry for user ${userId}`);
      
      const { data, error: insertError } = await supabase
        .from("token_usage")
        .insert({
          user_id: userId,
          month_year: monthYear,
          tokens_used: tokenCount
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error inserting token usage: ${insertError.message}`);
        throw insertError;
      }
      
      result = data;
    }
    
    // Check if the user has reached the token limit
    const { data: isAvailable } = await supabase.rpc(
      "check_token_availability",
      { user_id_param: userId }
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        tokenUsage: result,
        isAvailable
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error tracking token usage: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
