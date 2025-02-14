
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
  const outsetaJwtAccessToken = authHeader?.split(" ")[1] || "";

  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://${Deno.env.get("OUTSETA_DOMAIN")}/.well-known/jwks`)
    );

    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);

    payload.role = "authenticated";

    const supabaseEncodedJwtSecret = new TextEncoder().encode(
      Deno.env.get("SUPA_JWT_SECRET")
    );
    
    const supabaseJwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp || "2h")
      .sign(supabaseEncodedJwtSecret);

    return new Response(JSON.stringify({ supabaseJwt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
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
