#!/bin/bash

# Script to deploy the token exchange Edge Function to Supabase
# This will deploy the function with public access (no JWT required)

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Deploying Token Exchange Edge Function ===${NC}"
echo -e "This script will deploy your token exchange function to Supabase"

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}Checking Supabase CLI login status...${NC}"
if ! supabase login status &> /dev/null; then
    echo -e "${RED}Not logged in to Supabase CLI${NC}"
    echo "Please login with: supabase login"
    exit 1
fi

# Deploy the Edge Function
echo -e "${YELLOW}Deploying exchange function...${NC}"
supabase functions deploy exchange --no-verify-jwt

# Check deployment status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Success! Your token exchange function has been deployed${NC}"
    echo -e "It should now be available at:"
    echo -e "https://[YOUR-PROJECT-REF].supabase.co/functions/v1/exchange"
    echo -e "${YELLOW}Note: The function is now publicly accessible (no JWT required)${NC}"
    echo -e "This is necessary for token exchange"
else
    echo -e "${RED}Deployment failed. Check the error message above.${NC}"
    exit 1
fi

echo -e "${YELLOW}=== Done ===${NC}" 
