# Environment Variables Configuration

This document outlines all environment variables required for Readiverse Haven to function properly across different environments.

we have environmental variables in 4 places

local (.env)
supabase function secrets
vercel project settings
vercel env ls (the view in vercel CLI)

#3 and #4 are supposed to match but do not 😳

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
