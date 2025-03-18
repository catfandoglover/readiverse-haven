# Outseta-Supabase Token Exchange Fix

This folder contains tools to debug and fix the JWT token exchange between Outseta and Supabase.

## Python Token Checker

Use this to analyze Outseta tokens and test token creation:

```bash
source venv/bin/activate
python outseta_token_checker.py   # Original checker
python fixed_token_exchange.py    # Improved version
```

## Supabase Function Fixes

There are two implementation options:

### Basic Fix (Simple)
- `supabase_function_fix.ts`: Simple implementation that skips verification

### Production-Ready Fix (Recommended)
- `deno_fixed_exchange.ts`: Robust implementation using djwt with proper verification

To deploy:
```bash
cd supabase/functions
cp /path/to/deno_fixed_exchange.ts exchange/index.ts
supabase functions deploy exchange
```

## Key Improvements

1. **Dual verification approach**: Tries JWKS verification first, falls back to decoding if needed
2. **X.509 certificate handling**: Properly extracts public keys from X.509 certificates
3. **Algorithm compatibility**: Uses HS256 for Supabase token creation
4. **Complete user metadata**: Preserves all Outseta user data in the Supabase token
5. **Error handling**: Detailed logging and graceful fallbacks

## Token Format Requirements

Supabase tokens must include:
- `aud`: "authenticated"
- `sub`: User ID
- `role`: "authenticated"
- `exp`: Expiration time
- `iat`: Issued at time
