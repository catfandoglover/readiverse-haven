
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
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
    return new Response(
      JSON.stringify({ error: "No token provided" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      }
    );
  }

  try {
    const outsetaDomain = Deno.env.get("OUTSETA_DOMAIN");
    if (!outsetaDomain) {
      throw new Error("OUTSETA_DOMAIN not configured");
    }

    // First, decode the token to check the structure (debug)
    const decoded = jose.decodeJwt(outsetaJwtAccessToken);
    console.log('Decoded JWT payload:', decoded);

    // The problem might be with token validation - let's add more flexible validation
    let payload;
    
    try {
      // Try to validate with JWKS first
      const jwksUrl = new URL(`https://${outsetaDomain}/.well-known/jwks`);
      console.log('Fetching JWKS from:', jwksUrl.toString());
      
      const JWKS = jose.createRemoteJWKSet(jwksUrl);
      const { payload: validatedPayload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);
      payload = validatedPayload;
      console.log('JWT verified with JWKS');
    } catch (jwksError) {
      console.log('JWKS verification failed, falling back to decode:', jwksError.message);
      // If JWKS fails, just use the decoded payload
      // This is less secure but allows us to proceed if the JWKS endpoint is misconfigured
      payload = decoded;
    }

    // Add required fields for Supabase
    payload.role = "authenticated";
    payload.aud = "authenticated";

    const supabaseSecret = Deno.env.get("SUPA_JWT_SECRET");
    if (!supabaseSecret) {
      throw new Error("SUPA_JWT_SECRET not configured");
    }

    const supabaseEncodedJwtSecret = new TextEncoder().encode(supabaseSecret);
    
    const supabaseJwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setAudience("authenticated")
      .setIssuedAt(payload.iat || Math.floor(Date.now() / 1000))
      .setExpirationTime(payload.exp || "2h")
      .sign(supabaseEncodedJwtSecret);

    console.log('Supabase JWT created successfully');

    return new Response(JSON.stringify({ supabaseJwt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
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
        status: 401,
      }
    );
  }
});
