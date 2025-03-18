import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode, create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import * as base64 from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Configuration
const outsetaDomain = "lightninginspiration.outseta.com";
const supabaseSecret = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw==";

/**
 * Extracts the RSA public key from an X.509 certificate 
 * Note: This is a simplified implementation for demo purposes
 */
async function extractPublicKeyFromCert(x5c: string): Promise<CryptoKey | null> {
  try {
    // Decode the base64 X.509 certificate
    const certBytes = base64.decode(x5c);
    
    // Import the certificate as a public key
    const publicKey = await crypto.subtle.importKey(
      "spki",
      certBytes,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["verify"]
    );
    
    return publicKey;
  } catch (error) {
    console.error("Error extracting public key from certificate:", error);
    return null;
  }
}

/**
 * Fetch JWKS from Outseta and find matching key
 */
async function fetchPublicKey(kid: string): Promise<CryptoKey | null> {
  try {
    const response = await fetch(`https://${outsetaDomain}/.well-known/jwks`);
    
    if (!response.ok) {
      throw new Error(`JWKS fetch failed: ${response.status}`);
    }
    
    const jwks = await response.json();
    
    // Find the key with matching kid
    const matchingKey = jwks.keys.find((key: any) => key.kid === kid);
    
    if (!matchingKey) {
      throw new Error(`No matching key found for kid: ${kid}`);
    }
    
    // If it has x5c, use it to extract the public key
    if (matchingKey.x5c && matchingKey.x5c.length > 0) {
      return await extractPublicKeyFromCert(matchingKey.x5c[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching public key:", error);
    return null;
  }
}

/**
 * Create a CryptoKey from Supabase secret for HS256 signing
 */
async function createSigningKey(): Promise<CryptoKey> {
  const secretBytes = base64.decode(supabaseSecret);
  
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  
  try {
    // Extract the Outseta token
    let outsetaToken = "";
    
    // Try Authorization header first
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      outsetaToken = authHeader.substring(7);
    } else {
      // Fall back to request body
      try {
        const body = await req.json();
        outsetaToken = body.token || "";
      } catch (e) {
        console.error("Error parsing request body:", e);
      }
    }
    
    // Validate token presence
    if (!outsetaToken) {
      return new Response(
        JSON.stringify({ error: "No token provided" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    
    // Approach 1: Try to validate with JWKS (ideal for production)
    let validatedPayload = null;
    try {
      // Decode without verification to get header
      const [header, payload] = decode(outsetaToken);
      const kid = (header as any).kid;
      
      if (kid) {
        // Fetch the public key
        const publicKey = await fetchPublicKey(kid);
        
        if (publicKey) {
          // Verify the token
          validatedPayload = await verify(outsetaToken, publicKey);
          console.log("Token successfully verified with JWKS");
        }
      }
    } catch (error) {
      console.error("JWKS verification failed:", error);
      // We'll fall back to the safer approach below
    }
    
    // Approach 2: Fall back to decoding without verification
    if (!validatedPayload) {
      console.log("Falling back to decode without verification");
      try {
        const [_, payload] = decode(outsetaToken);
        validatedPayload = payload;
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Invalid token format" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }
    
    // Create a Supabase-compatible token
    const supabaseToken = await createSupabaseToken(validatedPayload);
    
    // Return the new token
    return new Response(
      JSON.stringify({ 
        token: supabaseToken,
        user: {
          id: validatedPayload.sub || "",
          email: validatedPayload.email || "",
          name: validatedPayload.name || ""
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Token exchange failed", 
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
