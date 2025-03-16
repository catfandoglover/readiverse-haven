#!/bin/bash
# Deploy the fixed exchange function

echo "Deploying fixed exchange function to Supabase..."
cd "$(dirname "$0")"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI not found. Please install it first."
    echo "Install guide: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Deploy the exchange function
echo "Deploying exchange function..."
cd ..
supabase functions deploy exchange

# Verify environment variables
echo ""
echo "Important: Make sure these environment variables are set in your Supabase project:"
echo "  - OUTSETA_DOMAIN: lightninginspiration.outseta.com"
echo "  - SUPA_JWT_SECRET: Your JWT secret"
echo ""
echo "To set them run:"
echo "  supabase secrets set OUTSETA_DOMAIN=lightninginspiration.outseta.com"
echo "  supabase secrets set SUPA_JWT_SECRET=your-secret-key"
echo ""
echo "Testing the function..."
echo "Try:"
echo "./functions/test-exchange.sh <YOUR_OUTSETA_TOKEN> https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/exchange <YOUR_SERVICE_ROLE_KEY>"
echo ""
echo "Deployment complete!"
