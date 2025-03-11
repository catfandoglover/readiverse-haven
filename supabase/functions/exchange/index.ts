
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log("Exchange function loaded");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request received");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Processing request...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      );
    }

    const outsetaJwtAccessToken = authHeader.split(" ")[1];
    if (!outsetaJwtAccessToken) {
      console.error("No token provided");
      return new Response(
        JSON.stringify({ error: "No token provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      );
    }

    const outsetaDomain = Deno.env.get("OUTSETA_DOMAIN");
    if (!outsetaDomain) {
      throw new Error("OUTSETA_DOMAIN not configured");
    }

    const jwksUrl = new URL(`https://${outsetaDomain}/.well-known/jwks`);
    console.log('Fetching JWKS from:', jwksUrl.toString());
    
    const JWKS = jose.createRemoteJWKSet(jwksUrl);

    // Verify the token
    let jwtVerifyResult;
    try {
      jwtVerifyResult = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return new Response(
        JSON.stringify({ 
          error: "Token verification failed", 
          details: verifyError.message 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      );
    }

    const payload = jwtVerifyResult.payload;
    console.log('JWT verified, payload:', JSON.stringify(payload));

    // Set the role to authenticated
    payload.role = "authenticated";

    const supabaseSecret = Deno.env.get("SUPA_JWT_SECRET");
    if (!supabaseSecret) {
      throw new Error("SUPA_JWT_SECRET not configured");
    }

    const supabaseEncodedJwtSecret = new TextEncoder().encode(supabaseSecret);
    
    // Create a JWT that Supabase will accept
    const supabaseJwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt()
      .setExpirationTime(payload.exp || "2h")
      .sign(supabaseEncodedJwtSecret);

    console.log('Supabase JWT created successfully');

    return new Response(
      JSON.stringify({ supabaseJwt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Token exchange error:", {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Invalid token or server error",
        details: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
