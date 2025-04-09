#!/bin/bash

# This script sets the necessary environment variables (secrets) for the edge functions

# Check if project ref is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <project-reference-id>"
  echo "Example: $0 myeyoafugkrkwcnfedlu"
  exit 1
fi

PROJECT_REF=$1

# Prompt for secrets
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "AWS Region: " AWS_REGION
read -p "Google Gemini API Key: " GOOGLE_GEMINI_API_KEY

# Set secrets
echo "Setting AWS_ACCESS_KEY_ID..."
supabase secrets set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" --project-ref "$PROJECT_REF"

echo "Setting AWS_SECRET_ACCESS_KEY..."
supabase secrets set AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" --project-ref "$PROJECT_REF"

echo "Setting AWS_REGION..."
supabase secrets set AWS_REGION="$AWS_REGION" --project-ref "$PROJECT_REF"

echo "Setting GOOGLE_GEMINI_API_KEY..."
supabase secrets set GOOGLE_GEMINI_API_KEY="$GOOGLE_GEMINI_API_KEY" --project-ref "$PROJECT_REF"

echo "All secrets set successfully!"
echo "You can now deploy the edge function with:"
echo "supabase functions deploy api-proxy --project-ref $PROJECT_REF" 