import json
import base64
import time
import sys
from jose import jwt
import requests

# Configuration - MUST MATCH function settings
SUPABASE_SECRET = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw=="

def decode_token_parts(token):
    """Safely decode JWT parts without verification for inspection"""
    parts = token.split('.')
    if len(parts) != 3:
        return None
    
    # Add padding to avoid base64 errors
    def add_padding(data):
        missing_padding = len(data) % 4
        if missing_padding:
            data += '=' * (4 - missing_padding)
        return data
    
    try:
        # Decode header
        header_padded = add_padding(parts[0])
        header = json.loads(base64.urlsafe_b64decode(header_padded).decode('utf-8'))
        
        # Decode payload
        payload_padded = add_padding(parts[1])
        payload = json.loads(base64.urlsafe_b64decode(payload_padded).decode('utf-8'))
        
        return {
            'header': header,
            'payload': payload,
            'signature': parts[2]
        }
    except Exception as e:
        print(f"Error decoding token parts: {e}")
        return None

def create_supabase_token(outseta_payload, supabase_secret):
    """Create a Supabase-compatible token from Outseta payload"""
    now = int(time.time())
    
    # Extract user info from Outseta payload
    outseta_user_id = outseta_payload.get("sub", "")
    email = outseta_payload.get("email", "")
    name = outseta_payload.get("name", "")
    
    # Create a payload matching Supabase's expected format
    supabase_payload = {
        "aud": "authenticated",  # Required for RLS
        "sub": outseta_user_id,  # User's ID
        "role": "authenticated",  # Required for RLS
        "exp": outseta_payload.get("exp", now + 3600),  # Expiration
        "iat": now,  # Issued at time
        "email": email,
        "app_metadata": {
            "provider": "outseta"
        },
        "user_metadata": {
            "full_name": name,
            "outseta_id": outseta_user_id,
            "outseta_account_id": outseta_payload.get("outseta:accountUid", ""),
            "outseta_subscription_id": outseta_payload.get("outseta:subscriptionUid", ""),
            "outseta_plan_id": outseta_payload.get("outseta:planUid", "")
        }
    }
    
    # Sign with Supabase secret using HS256 algorithm
    try:
        supabase_token = jwt.encode(supabase_payload, supabase_secret, algorithm="HS256")
        return supabase_token
    except Exception as e:
        print(f"Error creating Supabase token: {e}")
        return None

def exchange_token(outseta_token):
    """Exchange Outseta JWT for Supabase JWT"""
    print("\n=== OUTSETA TOKEN ANALYSIS ===")
    token_parts = decode_token_parts(outseta_token)
    
    if not token_parts:
        print("Failed to decode token")
        return None
    
    print("Token Header:")
    print(json.dumps(token_parts['header'], indent=2))
    print("\nToken Payload:")
    print(json.dumps(token_parts['payload'], indent=2))
    
    # Create Supabase token directly from decoded payload
    # Skip verification since we trust our auth provider
    print("\n=== CREATING SUPABASE TOKEN ===")
    supabase_token = create_supabase_token(token_parts['payload'], SUPABASE_SECRET)
    
    if supabase_token:
        print("Supabase token created successfully")
        supabase_token_parts = decode_token_parts(supabase_token)
        if supabase_token_parts:
            print("\nSupabase Token Header:")
            print(json.dumps(supabase_token_parts['header'], indent=2))
            print("\nSupabase Token Payload:")
            print(json.dumps(supabase_token_parts['payload'], indent=2))
        return supabase_token
    else:
        print("Failed to create Supabase token")
        return None

def test_token(supabase_token, api_url):
    """Test the generated token against a Supabase API endpoint"""
    print("\n=== TESTING SUPABASE TOKEN ===")
    print(f"API URL: {api_url}")
    
    headers = {
        "Authorization": f"Bearer {supabase_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(api_url, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print("Token authentication successful!")
            try:
                data = response.json()
                print(f"Response data: {json.dumps(data, indent=2)}")
            except:
                print(f"Response body: {response.text}")
        else:
            print("Token authentication failed")
            try:
                data = response.json()
                print(f"Error details: {json.dumps(data, indent=2)}")
            except:
                print(f"Response body: {response.text}")
    except Exception as e:
        print(f"Request error: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_exchange_direct.py <outseta_token> [api_url]")
        print("  - outseta_token: Your Outseta JWT token")
        print("  - api_url: (Optional) Supabase API URL to test the generated token")
        return
    
    # Get token from command line
    outseta_token = sys.argv[1]
    
    # Exchange the token
    supabase_token = exchange_token(outseta_token)
    
    if supabase_token:
        print("\n=== EXCHANGE SUCCESSFUL ===")
        print(f"Use this token in your Authorization header: Bearer {supabase_token}")
        
        # If API URL provided, test the token
        if len(sys.argv) > 2:
            api_url = sys.argv[2]
            test_token(supabase_token, api_url)
    else:
        print("\n=== EXCHANGE FAILED ===")
        print("Unable to create a valid Supabase token")

if __name__ == "__main__":
    main() 
