# Edge Function Migration Guide

This guide details the process of migrating API key access from client-side to secure edge functions.

## Overview

The migration involves:

1. Creating a consolidated edge function that handles both AWS Polly and Google Gemini API requests
2. Updating client services to use edge functions with fallback to direct API calls
3. Setting up environment variables and secrets in Supabase

## Edge Function Implementation

The consolidated `api-proxy` edge function provides two main services:

- AWS Polly text-to-speech synthesis
- Google Gemini AI chat and audio transcription

The function acts as a secure proxy, using server-side environment variables to access the APIs without exposing keys to the client.

## Deployment Steps

### 1. Set up Edge Function Environment Variables

You can use the provided helper script to set the required secrets:

```bash
./supabase/functions/set-secrets.sh myeyoafugkrkwcnfedlu
```

This will prompt you for:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- GOOGLE_GEMINI_API_KEY

Alternatively, you can set them manually in the Supabase dashboard.

### 2. Deploy the Edge Function

```bash
supabase functions deploy api-proxy --project-ref myeyoafugkrkwcnfedlu
```

### 3. Test the Edge Function

Use the provided test script to verify the edge function is working correctly:

```bash
./supabase/functions/test-api-proxy.sh myeyoafugkrkwcnfedlu
```

This will test both the AWS Polly and Gemini functionality.

### 4. Testing the Migration

The client services have been updated with a graceful fallback mechanism:

1. Try edge function first
2. Fall back to direct API access if edge function fails
3. Show appropriate error messages

This allows for a safe transition period where you can test the edge functions thoroughly before removing the direct API access.

### 5. Clean-up After Successful Migration

Once you've confirmed the edge functions are working correctly:

1. Remove the API keys from client-side environment variables
2. Optionally remove the fallback mechanisms in the client services

## Local Development

For local development and testing, you can run the edge function locally:

1. Create a `.env.local` file in the `supabase/functions` directory based on the provided `.env.local.example`
2. Run the edge function locally:

```bash
cd supabase/functions
supabase functions serve api-proxy --env-file .env.local
```

## Troubleshooting

If you encounter issues with the edge functions:

1. Check the Supabase edge function logs
2. Verify that all environment variables are set correctly
3. Test the edge function directly using the provided test script

## Security Considerations

- The edge function now securely handles all API keys
- No sensitive credentials are exposed in client-side code or network requests
- The application maintains full functionality with improved security 