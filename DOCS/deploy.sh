#!/bin/bash

# Simple script to deploy the exchange function with public access

echo "Deploying exchange function..."
cd "$(dirname "$0")/.."
supabase functions deploy exchange --no-verify-jwt

echo "Done!" 
