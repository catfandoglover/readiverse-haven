/// <reference path="../types/deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode, create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import * as base64 from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Configuration
const outsetaDomain = "lightninginspiration.outseta.com";
const SUPA_JWT_SECRET = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw==";
const OUTSETA_JWKS_URL = `https://${outsetaDomain}/.well-known/jwks`;

// Cache for JWKS keys (to avoid fetching on every request)
let jwksCache: any = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 3600000; // 1 hour in milliseconds

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

/**
 * Fetch and cache Outseta's JWKS (JSON Web Key Set)
 */
async function getOutsetaJWKS(): Promise<any> {
  const now = Date.now();
  
  // Use cached JWKS if available and not expired
  if (jwksCache && (now - jwksCacheTime < JWKS_CACHE_TTL)) {
    console.log('[exchange] Using cached JWKS');
    return jwksCache;
  }
  
  try {
    console.log(`[exchange] Fetching JWKS from ${OUTSETA_JWKS_URL}`);
    const response = await fetch(OUTSETA_JWKS_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
    }
    
    jwksCache = await response.json();
    jwksCacheTime = now;
    
    console.log('[exchange] JWKS fetched successfully:', jwksCache);
    return jwksCache;
  } catch (error) {
    console.error('[exchange] Error fetching JWKS:', error);
    throw error;
  }
}

/**
 * Find the matching JWK for a token based on the 'kid' in the header
 */
function findMatchingJWK(jwks: any, kid: string): any {
  if (!jwks || !jwks.keys || !Array.isArray(jwks.keys)) {
    throw new Error('Invalid JWKS format');
  }
  
  const matchingKey = jwks.keys.find((key: any) => key.kid === kid);
  if (!matchingKey) {
    throw new Error(`No matching key found for kid: ${kid}`);
  }
  
  return matchingKey;
}

/**
 * Convert a JWK to a CryptoKey for verification
 */
async function jwkToCryptoKey(jwk: any): Promise<CryptoKey> {
  try {
    // JWK from Outseta should be an RSA public key
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );
    
    return cryptoKey;
  } catch (error) {
    console.error('[exchange] Error importing JWK:', error);
    throw error;
  }
}

/**
 * Verify Outseta JWT token
 */
async function verifyOutsetaToken(token: string): Promise<any> {
  // First decode the header to get the key ID (kid)
  const [header] = decode(token);
  
  if (!header.kid) {
    throw new Error('Token header missing kid (key ID)');
  }
  
  // Get the JWKS from Outseta
  const jwks = await getOutsetaJWKS();
  
  // Find the matching JWK
  const matchingJWK = findMatchingJWK(jwks, header.kid);
  
  // Convert JWK to CryptoKey
  const cryptoKey = await jwkToCryptoKey(matchingJWK);
  
  // Verify the token
  const payload = await verify(token, cryptoKey);
  
  // Extra validation - check required claims
  const now = Math.floor(Date.now() / 1000);
  
  if (payload.exp && payload.exp < now) {
    throw new Error('Token has expired');
  }
  
  if (payload.nbf && payload.nbf > now) {
    throw new Error('Token not yet valid (nbf)');
  }
  
  if (!payload.sub) {
    throw new Error('Token missing subject (sub) claim');
  }
  
  // Check issuer if present
  if (payload.iss && !payload.iss.includes(outsetaDomain)) {
    throw new Error(`Invalid token issuer: ${payload.iss}`);
  }
  
  return payload;
}

/**
 * Create a CryptoKey from Supabase secret for HS256 signing
 */
async function createSigningKey(): Promise<CryptoKey> {
  const secretBytes = base64.decode(SUPA_JWT_SECRET);
  
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  
  return key;
}

/**
 * Safely decode JWT parts without verification
 */
function decodeTokenParts(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("Token does not have three parts");
    }
    
    // Add padding to avoid base64 errors
    const addPadding = (data: string): string => {
      const missingPadding = data.length % 4;
      if (missingPadding) {
        return data + "=".repeat(4 - missingPadding);
      }
      return data;
    };
    
    // Decode header
    const headerPadded = addPadding(parts[0]);
    const header = JSON.parse(new TextDecoder().decode(
      base64.decode(headerPadded.replace(/-/g, '+').replace(/_/g, '/'))
    ));
    
    // Decode payload
    const payloadPadded = addPadding(parts[1]);
    const payload = JSON.parse(new TextDecoder().decode(
      base64.decode(payloadPadded.replace(/-/g, '+').replace(/_/g, '/'))
    ));
    
    return {
      header,
      payload,
      signature: parts[2]
    };
  } catch (e) {
    console.error("[exchange] Error in manual token decoding:", e);
    return null;
  }
}

/**
 * Create a Supabase-compatible token
 */
async function createSupabaseToken(payload: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Create a Supabase-compatible payload
  const supabasePayload = {
    aud: "authenticated",
    sub: payload.sub || payload.email || "unknown_user",
    role: "authenticated",
    exp: payload.exp || (now + 3600),
    iat: now,
    email: payload.email || "",
    app_metadata: {
      provider: "outseta",
    },
    user_metadata: {
      full_name: payload.name || "",
      outseta_id: payload.sub || "",
      outseta_account_id: payload["outseta:accountUid"] || "",
      outseta_subscription_id: payload["outseta:subscriptionUid"] || "",
      outseta_plan_id: payload["outseta:planUid"] || "",
    },
  };
  
  console.log('[exchange] Creating Supabase payload:', supabasePayload);
  
  // Create signing key
  const key = await createSigningKey();
  
  // Create and sign the token
  const token = await create(
    { alg: "HS256", typ: "JWT" },
    supabasePayload,
    key
  );
  
  return token;
}

// HTTP server
serve(async (req) => {
  console.log(`[exchange] Handling ${req.method} request`);
  console.log('[exchange] Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  try {
    // Extract the Outseta token
    let outsetaToken = "";
    
    // Try Authorization header first
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      console.log("[exchange] Found Authorization header:", authHeader);
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        outsetaToken = parts[1];
        console.log("[exchange] Extracted token from Authorization header, length:", outsetaToken.length);
      } else {
        console.log("[exchange] Authorization header found but format is invalid:", authHeader);
      }
    } else {
      console.log("[exchange] No Authorization header found");
    }
    
    // If no token in header, try to extract from request body
    if (!outsetaToken) {
      try {
        console.log("[exchange] No token in header, checking request body");
        const clonedReq = req.clone(); // Clone the request since it can only be read once
        const bodyText = await clonedReq.text();
        console.log("[exchange] Request body raw text:", bodyText);
        
        if (bodyText) {
          try {
            const body = JSON.parse(bodyText);
            console.log("[exchange] Parsed JSON body:", body);
            if (body && body.token) {
              outsetaToken = body.token;
              console.log("[exchange] Extracted token from request body, length:", outsetaToken.length);
            } else {
              console.log("[exchange] No token field found in request body");
            }
          } catch (jsonError) {
            console.error("[exchange] Failed to parse JSON body:", jsonError);
          }
        } else {
          console.log("[exchange] Request body is empty");
        }
      } catch (e) {
        console.error("[exchange] Error reading request body:", e);
      }
    }
    
    // Validate token presence
    if (!outsetaToken) {
      console.log("[exchange] No token found in header or body");
      return new Response(
        JSON.stringify({ error: "No token provided", details: "Token must be provided in Authorization header or request body" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      );
    }
    
    console.log("[exchange] Processing token");
    
    // Try manual token decoding first to better diagnose potential issues
    const manualDecoded = decodeTokenParts(outsetaToken);
    if (manualDecoded) {
      console.log("[exchange] Manual token header:", manualDecoded.header);
      console.log("[exchange] Manual token payload:", manualDecoded.payload);
    } else {
      console.log("[exchange] Manual token decoding failed");
    }
    
    // Verify the Outseta token
    let validatedPayload;
    try {
      console.log("[exchange] Verifying Outseta token...");
      validatedPayload = await verifyOutsetaToken(outsetaToken);
      console.log("[exchange] Token verified successfully:", validatedPayload);
    } catch (verifyError) {
      console.error("[exchange] Token verification failed:", verifyError);
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid token", 
          details: verifyError instanceof Error ? verifyError.message : "Token verification failed" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        }
      );
    }
    
    // Create a Supabase-compatible token
    const supabaseToken = await createSupabaseToken(validatedPayload);
    console.log('[exchange] Supabase JWT created successfully');
    
    // Return the new token
    return new Response(
      JSON.stringify({ 
        supabaseJwt: supabaseToken,
        user: {
          id: validatedPayload.sub || "",
          email: validatedPayload.email || "",
          name: validatedPayload.name || ""
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[exchange] Token exchange error:", {
      message: err.message,
      stack: err.stack
    });
    
    // Provide detailed error messages for debugging
    return new Response(
      JSON.stringify({ 
        error: "Token exchange failed", 
        details: err.message,
        stack: err.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
