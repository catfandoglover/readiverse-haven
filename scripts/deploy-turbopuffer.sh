#!/bin/bash

# Make sure the Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI is not installed. Please install it first."
  echo "See: https://supabase.com/docs/guides/cli/getting-started"
  exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo "Docker is not running. Please start Docker Desktop first."
  exit 1
fi

echo "Deploying Turbopuffer API edge function..."

# Deploy the function with JWT verification disabled
supabase functions deploy turbopuffer-api --no-verify-jwt

echo "Deployment complete!"
echo "To test the function, run: supabase functions serve" 