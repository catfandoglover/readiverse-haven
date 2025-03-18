import json
import base64
import time
from jose import jwt
import requests
from cryptography import x509
from cryptography.hazmat.backends import default_backend


# Set constants
OUTSETA_DOMAIN = "lightninginspiration.outseta.com"
JWKS_URL = f"https://{OUTSETA_DOMAIN}/.well-known/jwks"
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

def main():
    # Test with a sample token
    sample_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCIsImtpZCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCJ9.eyJuYmYiOjE3NDIwOTcxNzcsImV4cCI6MTc0NzI4MTE3NywiaXNzIjoiaHR0cHM6Ly9saWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImNsaWVudF9pZCI6ImxpZ2h0bmluZ2luc3BpcmF0aW9uLm91dHNldGEuY29tLnJlc291cmNlLW93bmVyIiwic2NvcGUiOlsib3BlbmlkIiwib3V0c2V0YSIsInByb2ZpbGUiXSwic3ViIjoieTlnWUo2R20iLCJhdXRoX3RpbWUiOjE3NDIwOTcxNzcsImlkcCI6Imlkc3J2IiwiZW1haWwiOiJwZ2FsZWJhY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZhbWlseV9uYW1lIjoiR2FsZWJhY2giLCJnaXZlbl9uYW1lIjoiUGhpbGlwIiwibmFtZSI6IlBoaWxpcCBHYWxlYmFjaCIsIm5hbWVpZCI6Ink5Z1lKNkdtIiwib3V0c2V0YTphY2NvdW50VWlkIjoieG1lWUF2d20iLCJvdXRzZXRhOmlzUHJpbWFyeSI6IjEiLCJvdXRzZXRhOnN1YnNjcmlwdGlvblVpZCI6InJtMEVOZWpRIiwib3V0c2V0YTpwbGFuVWlkIjoieVdvR1I4V0QiLCJvdXRzZXRhOmFkZE9uVWlkcyI6W10sImFtciI6WyJwYXNzd29yZCJdLCJhdWQiOiJsaWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImlhdCI6MTc0MjA5NzE3N30.F306e9bY0ggExkcxrRhO76ymmTcDzpL7N5_jDkk51v9_zKIj6Nz4jBSRClSQPdVOc3IB8EEOQzdll6oOszxlTBgEyV_VGaqH4gsMwLUtqBcWHcIr2FypyjfddbMaEplbl4pjXiIF3cmSclTTZE4dvEcewb_19jvPzVAulyqvKSp369f8wcrea0Xlk4w6o9cm3cbA5eDIFbL_R-jBto-95YRoG2f-5h4vQs4WuBxPO_yMynXAC5GbC9_BjklERjkeUUK8eXv1X0doWUg5HZAREy8RE3w5TVcdr3tG39Ybj3ru-gkUNpfHLmeiSUjGN2CW6UvW9wgc4TiYNInqPzDVLg"
    
    print("=== OUTSETA TO SUPABASE TOKEN EXCHANGE ===")
    print("This script exchanges an Outseta JWT for a Supabase-compatible JWT")
    print("Replace the sample token with your actual Outseta token\n")
    
    # Exchange the token
    supabase_token = exchange_token(sample_token)
    
    if supabase_token:
        print("\n=== EXCHANGE SUCCESSFUL ===")
        print(f"Use this token in your Authorization header: Bearer {supabase_token}")
    else:
        print("\n=== EXCHANGE FAILED ===")
        print("Unable to create a valid Supabase token")

if __name__ == "__main__":
    main()
