#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$DIR/.env"

echo "Updating .env file with API keys"
echo "================================"

# Read Hugging Face API key
read -p "Enter your Hugging Face API key: " HF_KEY
# Read Turbopuffer API key
read -p "Enter your Turbopuffer API key: " TP_KEY

# Update the .env file
sed -i '' "s|HUGGINGFACE_API_KEY=.*|HUGGINGFACE_API_KEY=$HF_KEY|g" "$ENV_FILE"
sed -i '' "s|TURBOPUFFER_API_KEY=.*|TURBOPUFFER_API_KEY=$TP_KEY|g" "$ENV_FILE"

echo "API keys have been updated in $ENV_FILE" 