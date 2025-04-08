
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
    // Get auth token from request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate auth token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }
    
    const userId = userData.user.id;
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Fetch subscription status
    const { data: subscriptionData } = await supabase
      .from("customers")
      .select("subscription_status, subscription_tier")
      .eq("user_id", userId)
      .maybeSingle();
    
    const isSubscriber = subscriptionData?.subscription_tier === "surge" && 
                         subscriptionData?.subscription_status === "active";
    
    // Fetch token limit from revenue_items
    const { data: tokenLimitData } = await supabase
      .from("revenue_items")
      .select("purpose")
      .eq("id", "3f6ae6e0-3d8d-43fe-b78d-6996b01d8a7c")
      .single();
    
    const tokenLimit = tokenLimitData?.purpose ? parseInt(tokenLimitData.purpose) : 60000;
    
    // Get token usage for current month
    const { data: usageData } = await supabase
      .from("token_usage")
      .select("tokens_used")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .maybeSingle();
    
    const tokensUsed = usageData?.tokens_used || 0;
    const percentUsed = isSubscriber ? 0 : Math.min(100, Math.round((tokensUsed / tokenLimit) * 100));
    const hasAvailableTokens = isSubscriber || tokensUsed < tokenLimit;
    
    return new Response(
      JSON.stringify({
        tokensUsed,
        tokenLimit,
        percentUsed,
        hasAvailableTokens,
        isSubscriber,
        monthYear
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error getting token usage: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
