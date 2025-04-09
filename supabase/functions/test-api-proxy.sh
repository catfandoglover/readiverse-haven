#!/bin/bash

# This script tests the api-proxy edge function

# Check if project ref is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <project-reference-id>"
  echo "Example: $0 myeyoafugkrkwcnfedlu"
  exit 1
fi

PROJECT_REF=$1
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/api-proxy"
JWT_TOKEN=""

# Get JWT token if provided
if [ ! -z "$2" ]; then
  JWT_TOKEN="Authorization: Bearer $2"
fi

# Test AWS Polly TTS
echo "Testing AWS Polly text-to-speech..."
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  ${JWT_TOKEN:+"-H"} ${JWT_TOKEN:+"$JWT_TOKEN"} \
  -d '{"service":"polly","action":"synthesize","params":{"text":"Hello world, testing the edge function"}}' | jq

echo ""

# Test Gemini Chat
echo "Testing Gemini Chat..."
curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  ${JWT_TOKEN:+"-H"} ${JWT_TOKEN:+"$JWT_TOKEN"} \
  -d '{"service":"gemini","action":"chat","params":{"messages":[{"parts":[{"text":"Hello, how are you?"}],"role":"user"}]}}' | jq

echo ""
echo "If you see valid responses above, the edge function is working correctly!" 