#!/bin/bash
# Test exchange function with curl

# Get arguments
TOKEN="$1"
URL="${2:-https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/exchange}"
SERVICE_KEY="$3"

if [ -z "$TOKEN" ]; then
  echo "Error: Please provide an Outseta token as the first argument"
  echo "Usage: ./test-exchange.sh <outseta-token> [edge-function-url] [service-role-key]"
  exit 1
fi

echo "Testing token exchange at: $URL"
echo "Token (first 10 chars): ${TOKEN:0:10}..."

if [ -n "$SERVICE_KEY" ]; then
  echo "Using service role key for authentication"
  echo ""
  echo "Sending request with token in body and service key in header..."
  curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -d "{\"token\":\"$TOKEN\"}" \
    "$URL"
else
  echo ""
  echo "Sending request with token in body (no service key)..."
  curl -X POST \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$TOKEN\"}" \
    "$URL"
fi

echo ""
