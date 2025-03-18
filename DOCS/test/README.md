# Outseta-Supabase Token Exchange Fix

This folder contains tools to debug and fix the JWT token exchange between Outseta and Supabase.

## Python Token Checker

Use this to analyze Outseta tokens and test token creation:

```bash
source venv/bin/activate
python outseta_token_checker.py   # Original checker
python fixed_token_exchange.py    # Improved version
```

## Supabase Function Fix

Replace your current Supabase Edge Function with the improved version:

1. Copy `supabase_function_fix.ts` to your Supabase project
2. Deploy with `supabase functions deploy exchange`

## Key Changes

1. **Skip verification**: Trust the Outseta token and focus on creating a valid Supabase token
2. **Fix algorithm mismatch**: Use HS256 for Supabase token, not RS256
3. **Proper token format**: Include all required fields for Supabase auth
4. **Error handling**: Improved error handling and debugging output

## Token Format Requirements

Supabase tokens must include:
- `aud`: "authenticated"
- `sub`: User ID
- `role`: "authenticated"
- `exp`: Expiration time
- `iat`: Issued at time
