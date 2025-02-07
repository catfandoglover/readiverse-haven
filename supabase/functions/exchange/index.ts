import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Get Outseta JWT from Authorization header
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
    // Get JWKS from Outseta's well-known endpoint
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://${Deno.env.get("OUTSETA_DOMAIN")}/.well-known/jwks`)
    );

    // Verify the Outseta token
    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);

    // Add Supabase role to the payload
    payload.role = "authenticated";

    // Get Supabase JWT secret from environment
    const supabaseSecret = Deno.env.get("SUPA_JWT_SECRET");
    if (!supabaseSecret) {
      throw new Error("Supabase JWT secret not configured");
    }

    // Create signing key for Supabase JWT
    const supabaseEncodedJwtSecret = new TextEncoder().encode(supabaseSecret);
    
    // Create new JWT for Supabase
    const supabaseJwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp || "2h") // Use original exp or 2 hours
      .sign(supabaseEncodedJwtSecret);

    // Return the new Supabase JWT
    return new Response(
      JSON.stringify({ supabaseJwt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Token exchange error:", error.message);
    return new Response(
      JSON.stringify({ error: "Invalid token or server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      }
    );
  }
});
