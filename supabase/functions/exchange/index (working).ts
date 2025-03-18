/// <reference path="../types/deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode, create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import * as base64 from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Configuration
const outsetaDomain = "lightninginspiration.outseta.com";
const SUPA_JWT_SECRET = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw==";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

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
    
    // Decode the token using the djwt library
    let validatedPayload;
    try {
      const [header, payload] = decode(outsetaToken);
      console.log("[exchange] Token header from djwt:", header);
      validatedPayload = payload;
      console.log("[exchange] Token decoded successfully:", validatedPayload);
    } catch (error) {
      console.error("[exchange] Token decode failed:", error);
      // Add more debug info about the token
      console.error("[exchange] Token that failed to decode:", outsetaToken);
      
      // If manual decoding worked but library decoding failed
      if (manualDecoded) {
        console.log("[exchange] Using manually decoded payload as fallback");
        validatedPayload = manualDecoded.payload;
      } else {
        return new Response(
          JSON.stringify({ 
            error: "Invalid token format", 
            details: error instanceof Error ? error.message : "Unknown error" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
        );
      }
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
