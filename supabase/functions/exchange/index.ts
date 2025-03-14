import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  console.log("Token exchange function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Debug environment variables
  console.log("Environment variables check:");
  console.log("OUTSETA_DOMAIN exists:", !!Deno.env.get("OUTSETA_DOMAIN"));
  console.log("SUPA_JWT_SECRET exists:", !!Deno.env.get("SUPA_JWT_SECRET"));
  
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.log("Missing Authorization header");
    return new Response(
      JSON.stringify({ error: "No authorization header" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      }
    );
  }

  console.log("Auth header present:", authHeader.substring(0, 15) + "...");
  
  const outsetaJwtAccessToken = authHeader.split(" ")[1];
  if (!outsetaJwtAccessToken) {
    console.log("No token in Authorization header");
    return new Response(
      JSON.stringify({ error: "No token provided" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      }
    );
  }

  console.log("Token extracted successfully, length:", outsetaJwtAccessToken.length);
  
  try {
    const outsetaDomain = Deno.env.get("OUTSETA_DOMAIN");
    if (!outsetaDomain) {
      console.log("OUTSETA_DOMAIN env var missing");
      throw new Error("OUTSETA_DOMAIN not configured");
    }

    console.log("Using OUTSETA_DOMAIN:", outsetaDomain);
    
    // Inspect token structure before verification
    try {
      const decodedTokenParts = outsetaJwtAccessToken.split('.');
      if (decodedTokenParts.length !== 3) {
        console.log('Token does not appear to be a valid JWT format');
        throw new Error('Invalid token format');
      }
      
      // Decode header and payload for inspection
      const header = JSON.parse(atob(decodedTokenParts[0]));
      console.log('Token header:', JSON.stringify(header));
      
      try {
        // Try to decode the payload for debugging
        const payload = JSON.parse(atob(decodedTokenParts[1]));
        console.log('Token payload preview:', JSON.stringify({
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat
        }));
      } catch (payloadError) {
        console.error("Failed to decode payload:", payloadError.message);
      }
      
      // This helps confirm if the JWKS key ID matches what's in your token
      console.log('Token kid:', header.kid);
      console.log('Expected JWKS URL:', `https://${outsetaDomain}/.well-known/jwks`);
    } catch (decodeError) {
      console.error("Token decode inspection failed:", decodeError.message);
      // Continue with verification attempt anyway
    }
    
    // Fetch JWKS from Outseta
    try {
      const jwksUrl = new URL(`https://${outsetaDomain}/.well-known/jwks`);
      console.log('Fetching JWKS from:', jwksUrl.toString());
      
      // Try to fetch the JWKS directly to verify it's accessible
      const jwksResponse = await fetch(jwksUrl);
      if (!jwksResponse.ok) {
        console.error("Failed to fetch JWKS:", jwksResponse.status, jwksResponse.statusText);
        throw new Error(`Failed to fetch JWKS: ${jwksResponse.status} ${jwksResponse.statusText}`);
      }
      
      const jwksData = await jwksResponse.json();
      console.log("JWKS fetch successful, keys count:", jwksData.keys?.length || 0);
      
      const JWKS = jose.createRemoteJWKSet(jwksUrl);
      console.log("JWKS created, attempting to verify token");
      
      try {
        const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS, {
          // Add any additional verification options if needed
          issuer: `https://${outsetaDomain}`,
        });
        console.log('JWT verified, payload:', JSON.stringify(payload));

        // Add the authenticated role to the payload
        payload.role = "authenticated";

        const supabaseSecret = Deno.env.get("SUPA_JWT_SECRET");
        if (!supabaseSecret) {
          console.log("SUPA_JWT_SECRET env var missing");
          throw new Error("SUPA_JWT_SECRET not configured");
        }

        console.log("SUPA_JWT_SECRET exists with length:", supabaseSecret.length);
        
        const supabaseEncodedJwtSecret = new TextEncoder().encode(supabaseSecret);
        
        const supabaseJwt = await new jose.SignJWT(payload)
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setIssuer("supabase")
          .setIssuedAt(payload.iat)
          .setExpirationTime(payload.exp || "2h")
          .sign(supabaseEncodedJwtSecret);

        console.log('Supabase JWT created successfully');

        return new Response(JSON.stringify({ supabaseJwt }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (verifyError) {
        console.error("JWT verification failed:", verifyError.message, verifyError.stack);
        throw verifyError;
      }
    } catch (jwksError) {
      console.error("JWKS error:", jwksError.message, jwksError.stack);
      throw jwksError;
    }
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
