Environment Variables Management in Lovable
Lovable uses a multi-layered approach for handling environment variables and secrets:

note vercel only updates environmental variables when a new deployment happens. also it seems that what we see in vercel env ls (via vercel CLI) is what actually matters.


1. Frontend Environment Variables
Vite Environment Variables: Lovable uses Vite's standard mechanism via import.meta.env.VARIABLE_NAME
Type Definitions: These are defined in src/vite-env.d.ts to provide type safety
Usage Example: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
2. Backend Secrets (Supabase Edge Functions)
Supabase Secrets: Stored as Supabase Edge Function secrets
Access Method: Inside Edge Functions using Deno.env.get('SECRET_NAME')
Setting Secrets: Via Supabase CLI with supabase secrets set NAME=value
3. Environment Variables Storage Locations
As documented in your project, environment variables are stored in four places:

Local Development: .env file in your project root
Supabase Function Secrets: Set via Supabase CLI
Vercel Project Settings: For production deployments
Vercel CLI View: Accessible via vercel env ls
4. Secure Secret Access Pattern
Your project uses a secure pattern to access sensitive keys:


commands

 vercel env ls
 vercel env pull

update a variable....

   vercel env rm VARIABLE_NAME 
   vercel env add VARIABLE_NAME


First try to access directly from environment variables
If not available, fetch via a secure Edge Function
Fall back to development defaults only in DEV mode

For example, in AIService.ts:
// Try 1: Direct environment variable
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
if (apiKey) { use it... }

// Try 2: Edge function fallback
const secretKey = await this.fetchSecretFromEdgeFunction();
if (secretKey) { use it... }

// Try 3: Development fallback (DEV only)
if (import.meta.env.DEV) { 
  const devKey = '...';
  // Use development key
}

5. Environment Variables Consistency
It's crucial to maintain consistency across environments. As your documentation mentions:

Environment variables must be identical across local, Vercel, and Supabase environments
JWT secrets especially must match across all environments
No quotes should be used when setting these variables
6. Edge Function Deployment Notes
When deploying Edge Functions with secrets:

Local deployment using Supabase CLI is recommended
Functions must be publicly accessible with JWT verification disabled
Edge Functions may pull from local .env files in addition to Supabase secrets
7. Handling Process.env
Your project's Vite config provides a fallback for process.env to ensure compatibility

define: {
  'process.env': {}
}

This is important for libraries that expect process.env to be defined.

The way your project handles environment variables and secrets follows best practices by:

Not hardcoding sensitive values
Providing multiple fallback mechanisms
Handling secrets securely through backend services
Offering development convenience while maintaining production security









#OLD UNDERSTANDING Environment Variables Configuration

This document outlines all environment variables required for Readiverse Haven to function properly across different environments.

we have environmental variables in 4 places

local (.env)
supabase function secrets
vercel project settings
vercel env ls (the view in vercel CLI)

#3 and #4 now match after a manual override. 

use "vercel env ls" in the vercel CLI to see what the environmental variables are. 

## Overview

The application relies on three different environments:
1. **Local Development** (.env file)
2. **Vercel Deployment** (Vercel environment variables)
3. **Supabase Edge Functions** (Supabase secrets)

## Required Environment Variables

### Local Development (.env)

These variables should be in your local `.env` file:

| Variable | Description | Format | Required |
|----------|-------------|--------|----------|
| `OUTSETA_DOMAIN` | Your Outseta domain | No quotes | Yes |
| `SUPA_JWT_SECRET` | Secret for signing JWT tokens | No quotes | Yes |
| `SUPABASE_URL` | Your Supabase project URL | No quotes | Yes |
| `SUPABASE_ANON_KEY` | Anon/public key for Supabase | No quotes | Yes |

### Vercel Deployment

These variables must be set in Vercel project settings:

| Variable | Description | Format | Required |
|----------|-------------|--------|----------|
| `OUTSETA_DOMAIN` | Your Outseta domain | No quotes | Yes |
| `SUPA_JWT_SECRET` | Secret for signing JWT tokens | No quotes | Yes |
| `SUPABASE_URL` | Your Supabase project URL | No quotes | Yes |
| `SUPABASE_ANON_KEY` | Anon/public key for Supabase | No quotes | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin access) | No quotes | Optional |

### Supabase Edge Functions

These secrets must be set in Supabase using `supabase secrets set`:

| Variable | Description | Format | Required |
|----------|-------------|--------|----------|
| `OUTSETA_DOMAIN` | Your Outseta domain | No quotes | Yes |
| `SUPA_JWT_SECRET` | Secret for signing JWT tokens | No quotes | Yes |

## Common Issues

1. **401 Unauthorized Errors**: Typically caused by missing or incorrect environment variables in Supabase Edge Functions. Ensure `OUTSETA_DOMAIN` and `SUPA_JWT_SECRET` are correctly set in Supabase.

2. **Token Exchange Failures**: May occur if the JWT secret doesn't match between environments. The same `SUPA_JWT_SECRET` must be used in all environments.

3. **Hardcoded URLs**: The application has some hardcoded URLs in files like `/src/integrations/supabase/token-exchange.ts`. If you're using a different Supabase project in production vs. development, you may need to update these URLs.

## How to Set Environment Variables

### Local Development
Create a `.env` file in the root directory with the required variables.

### Vercel
Set environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

### Supabase Edge Functions
Use the Supabase CLI:
```bash
supabase secrets set OUTSETA_DOMAIN=yourdomain.outseta.com SUPA_JWT_SECRET=your_secret_key
```

## Important Notes

1. Environment variables in different environments must be consistent, especially `SUPA_JWT_SECRET` which is used for token verification.

2. None of these variables should be quoted when set in configuration files.

3. If you change Supabase projects between environments, you must update hardcoded URLs or make them configurable.

4. For production deployments, ensure all variables are set in both the "Production" and "Preview" environments on Vercel.


The duplication across all three environments is due to how the authentication flow works:

  1. Local Development: Your local server needs these variables to process authentication during
  development and testing.
  2. Vercel: These variables are needed because some server-side rendering or build processes might
   require them. Vercel needs access to these values at build time.
  3. Supabase Edge Functions: The token exchange function (exchange) runs on Supabase's
  infrastructure, completely separate from your Vercel deployment. It needs direct access to these
  variables to:
    - Verify Outseta JWT tokens (requires OUTSETA_DOMAIN)
    - Sign new Supabase JWT tokens (requires SUPA_JWT_SECRET)

  The duplication happens because each environment is a separate runtime context. The Supabase Edge
   Function runs on Supabase's servers, not on Vercel or your local machine, so it needs its own
  copy of the environment variables.

  The JWT secret especially must be identical across all environments to ensure tokens signed in
  one environment can be verified in another.
