# Supabase + Outseta Auth with Row Level Security (RLS) Integration Guide

## Overview
Supabase's Row Level Security (RLS) can be used with Outseta Auth through a token exchange process. The key is to exchange your authenticated user's Outseta JWT Access Token for a Supabase-signed JWT Access Token.

## Token Exchange Process
The token exchange must happen server-side and involves these steps:

1. **Verify Outseta JWT**
   - Use your Outseta JWT Public Key from:
     - Auth > Sign up and Login > Login settings > JWT Key
     - Or use well-known URL: `https://[your-domain]/.well-known/jwks`

2. **Create New JWT**
   - Set `role` to "authenticated"
   - Copy over all other claims from Outseta JWT

3. **Sign with Supabase**
   - Sign using your Supabase JWT Secret
   - Found at: Project Settings > API Settings > JWT Settings > JWT Secret

## Implementation Using Supabase Edge Function

```typescript
// File: /functions/exchange/index.ts
// Deploy with: supabase functions deploy exchange --no-verify-jwt

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

  // Get Outseta JWT from Authorization header
  const authHeader = req.headers.get("Authorization");
  const outsetaJwtAccessToken = authHeader?.split(" ")[1] || "";

  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://${Deno.env.get("OUTSETA_DOMAIN")}/.well-known/jwks`)
    );

    // Verify token with JWK
    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);

    // Update JWT for Supabase
    payload.role = "authenticated";

    const supabaseEncodedJwtSecret = new TextEncoder().encode(
      Deno.env.get("SUPA_JWT_SECRET")
    );
    
    const supabaseJwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp || "")
      .sign(supabaseEncodedJwtSecret);

    return new Response(JSON.stringify({ supabaseJwt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error(error.message, { outsetaJwtAccessToken });
    return new Response(JSON.stringify({ error: "Invalid" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});
```

## Using the Supabase JWT

After obtaining the Supabase-signed JWT, use it in your client:

```typescript
const supabaseClient = supabase.createClient(
  <your_supabase_url>,
  <your_supabase_anon_key>,
  {
    global: {
      headers: {Authorization: `Bearer ${supabaseJwt}`}
    }
  }
);
```

## Accessing JWT Claims in RLS Policies

The decoded and verified JWT is available in RLS Policies through `auth.jwt()`:

- Get Person Uid: `auth.jwt() ->> 'sub'::text`
- Get Account Uid: `auth.jwt() ->> 'outseta:accountUid'::text`

## Example RLS Policy

To restrict deleting of a todo to the user that created it:

```sql
CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING (person_uid = (auth.jwt() ->> 'sub'::text));
```

## Example Default Value

To automatically set an account ID when creating records:

```sql
ALTER TABLE todos 
ALTER COLUMN account_uid 
SET DEFAULT auth.jwt() ->> 'outseta:accountUid'::text;
```

## Important Notes
- Deploy the exchange function with: `supabase functions deploy exchange --no-verify-jwt`
- Always verify tokens server-side
- Keep your JWT secrets secure
- Consider token expiration and refresh flows
