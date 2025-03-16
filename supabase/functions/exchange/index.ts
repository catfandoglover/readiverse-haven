/// <reference path="../types/deno.d.ts" />

// @deno-types="https://deno.land/x/types/index.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "npm:jose@4.14.4";

// Declare Deno namespace for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Define request type
interface Request {
  method: string;
  headers: Headers;
  json(): Promise<any>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
  console.log(`[exchange] Handling ${req.method} request`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Check for token in Authorization header and body
  let outsetaJwtAccessToken: string | null = null;
  
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    console.log("[exchange] Found Authorization header");
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      outsetaJwtAccessToken = parts[1];
    }
  }
  
  // If no token in header, try to extract from request body
  if (!outsetaJwtAccessToken) {
    try {
      console.log("[exchange] No token in header, checking request body");
      const body = await req.json();
      if (body && body.token) {
        outsetaJwtAccessToken = body.token;
      }
    } catch (e) {
      console.log("[exchange] No JSON body or couldn't parse:", e);
    }
  }
  
  if (!outsetaJwtAccessToken) {
    console.log("[exchange] No token found in header or body");
    return new Response(
      JSON.stringify({ error: "No token provided", details: "Token must be provided in Authorization header or request body" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      }
    );
  }

  try {
    console.log("[exchange] Processing token");
    
    // Get Outseta domain from environment variables

    const outsetaDomain = "lightninginspiration.outseta.com";
    const jwksUrlString = `https://${outsetaDomain}/.well-known/jwks`;

    // const outsetaDomain = Deno.env.get("OUTSETA_DOMAIN");
    if (!outsetaDomain) {
      console.error("[exchange] Missing OUTSETA_DOMAIN environment variable");
      throw new Error("OUTSETA_DOMAIN not configured");
    }
    
    // Validate domain format - remove any https:// prefix if accidentally included in env var
    const cleanDomain = outsetaDomain.replace(/^https?:\/\//, '');
    console.log("[exchange] Using Outseta domain:", cleanDomain);
    
    // Form the JWKS URL using the clean domain
    // const jwksUrlString = `https://${cleanDomain}/.well-known/jwks`;
    console.log('[exchange] Fetching JWKS from:', jwksUrlString);
    
    // Create remote JWKS (JSON Web Key Set) for token verification
    console.log('[exchange] Creating remote JWKS with URL:', jwksUrlString);
    const JWKS = jose.createRemoteJWKSet(new URL(jwksUrlString));

    // Verify the Outseta JWT
    console.log('[exchange] Verifying token...');
    
    // Decode the token first to see what we're working with
    const decoded = jose.decodeJwt(outsetaJwtAccessToken);
    console.log('[exchange] Decoded token payload:', decoded);
    
    // Verify with the JWKS, allowing both non-www and www issuers
    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS, {
      issuer: [`https://${outsetaDomain}`, `https://www.${outsetaDomain}`]
    });
    
    console.log('[exchange] JWT verified, payload:', payload);

    // Add Supabase role to the payload
    const payloadWithRole = { 
      ...payload, 
      role: "authenticated",
      // Add a user identifier that Supabase policies can use
      sub: payload.sub || payload.email || payload.user_id,
      email: payload.email,
      // Explicitly set aud to match what Supabase expects
      aud: "authenticated"
    };
    console.log('[exchange] Enhanced payload:', payloadWithRole);

    // Get Supabase JWT secret from environment variables
    // const supabaseSecret = Deno.env.get("SUPA_JWT_SECRET");
    const supabaseSecret = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw==";
    if (!supabaseSecret) {
      console.error("[exchange] Missing SUPA_JWT_SECRET environment variable");
      throw new Error("SUPA_JWT_SECRET not configured");
    }
    console.log('[exchange] SUPA_JWT_SECRET available (not logging it)');

    // Encode the Supabase JWT secret
    const supabaseEncodedJwtSecret = new TextEncoder().encode(supabaseSecret);
    
    // Create a new JWT for Supabase
    console.log('[exchange] Creating Supabase JWT');
    const supabaseJwt = await new jose.SignJWT(payloadWithRole)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt(payload.iat || Math.floor(Date.now() / 1000))
      .setExpirationTime(payload.exp || Math.floor(Date.now() / 1000) + 7200) // Default to 2 hours if no exp
      .sign(supabaseEncodedJwtSecret);

    console.log('[exchange] Supabase JWT created successfully');

    return new Response(JSON.stringify({ supabaseJwt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[exchange] Token exchange error:", {
      message: err.message,
      stack: err.stack
    });
    
    // Provide detailed error messages for debugging
    return new Response(
      JSON.stringify({ 
        error: "Invalid token or server error",
        details: err.message,
        stack: err.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      }
    );
  }
});
