import json
import base64
import time
from jose import jwt, jwk, jws
from jose.utils import base64url_decode
import requests

# Example Outseta token (truncated from your logs)
outseta_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCIsImtpZCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCJ9.eyJuYmYiOjE3NDIwOTcxNzcsImV4cCI6MTc0NzI4MTE3NywiaXNzIjoiaHR0cHM6Ly9saWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImNsaWVudF9pZCI6ImxpZ2h0bmluZ2luc3BpcmF0aW9uLm91dHNldGEuY29tLnJlc291cmNlLW93bmVyIiwic2NvcGUiOlsib3BlbmlkIiwib3V0c2V0YSIsInByb2ZpbGUiXSwic3ViIjoieTlnWUo2R20iLCJhdXRoX3RpbWUiOjE3NDIwOTcxNzcsImlkcCI6Imlkc3J2IiwiZW1haWwiOiJwZ2FsZWJhY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZhbWlseV9uYW1lIjoiR2FsZWJhY2giLCJnaXZlbl9uYW1lIjoiUGhpbGlwIiwibmFtZSI6IlBoaWxpcCBHYWxlYmFjaCIsIm5hbWVpZCI6Ink5Z1lKNkdtIiwib3V0c2V0YTphY2NvdW50VWlkIjoieG1lWUF2d20iLCJvdXRzZXRhOmlzUHJpbWFyeSI6IjEiLCJvdXRzZXRhOnN1YnNjcmlwdGlvblVpZCI6InJtMEVOZWpRIiwib3V0c2V0YTpwbGFuVWlkIjoieVdvR1I4V0QiLCJvdXRzZXRhOmFkZE9uVWlkcyI6W10sImFtciI6WyJwYXNzd29yZCJdLCJhdWQiOiJsaWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImlhdCI6MTc0MjA5NzE3N30.F306e9bY0ggExkcxrRhO76ymmTcDzpL7N5_jDkk51v9_zKIj6Nz4jBSRClSQPdVOc3IB8EEOQzdll6oOszxlTBgEyV_VGaqH4gsMwLUtqBcWHcIr2FypyjfddbMaEplbl4pjXiIF3cmSclTTZE4dvEcewb_19jvPzVAulyqvKSp369f8wcrea0Xlk4w6o9cm3cbA5eDIFbL_R-jBto-95YRoG2f-5h4vQs4WuBxPO_yMynXAC5GbC9_BjklERjkeUUK8eXv1X0doWUg5HZAREy8RE3w5TVcdr3tG39Ybj3ru-gkUNpfHLmeiSUjGN2CW6UvW9wgc4TiYNInqPzDVLg"

# Supabase Secret from your logs
supabase_secret = "vWuwcintxMuwsNQuwhbDlxBYGdWW46un9S6QxbHrB06e9AAurTIRh6hRejlVzVqk1VjXwrmz31BluDHo9OpOBw=="

# Outseta domain
outseta_domain = "lightninginspiration.outseta.com"
jwks_url = f"https://{outseta_domain}/.well-known/jwks"

def decode_token_parts(token):
    """Decode JWT parts without verification for inspection"""
    parts = token.split('.')
    if len(parts) != 3:
        return None
    
    # Decode header and payload
    try:
        header = json.loads(base64.b64decode(parts[0] + '==').decode('utf-8'))
        payload = json.loads(base64.b64decode(parts[1] + '==').decode('utf-8'))
        return {
            'header': header,
            'payload': payload,
            'signature': parts[2]
        }
    except Exception as e:
        print(f"Error decoding token parts: {e}")
        return None

def fetch_jwks(jwks_url):
    """Fetch the JWKS from Outseta"""
    try:
        response = requests.get(jwks_url)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to get JWKS: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None

def verify_outseta_token(token, jwks_url):
    """Verify the Outseta token using JWKS"""
    try:
        # Decode without verification first to get the header
        token_parts = decode_token_parts(token)
        if not token_parts:
            return False, "Invalid token format"
        
        # Get the key ID from the header
        kid = token_parts['header'].get('kid')
        if not kid:
            return False, "No kid in token header"
        
        # Fetch JWKS from Outseta
        jwks = fetch_jwks(jwks_url)
        if not jwks:
            return False, "Failed to fetch JWKS"
        
        # Find the matching key
        public_key = None
        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                public_key = jwk.construct(key)
                break
        
        if not public_key:
            return False, "No matching key found in JWKS"
        
        # Verify the token
        options = {"verify_signature": True, "verify_aud": False}
        payload = jwt.decode(token, key=public_key.to_pem().decode('utf-8'), 
                            algorithms=["RS256"], options=options)
        
        return True, payload
    except Exception as e:
        return False, f"Token verification failed: {e}"

def check_for_supabase_requirements(payload):
    """Check if the token payload meets Supabase requirements"""
    requirements = {
        "sub": "Subject (user identifier)",
        "iss": "Issuer (should match domain)",
        "exp": "Expiration time",
        "iat": "Issued at time",
        "role": "User role for RLS policies"
    }
    
    missing = []
    for req, desc in requirements.items():
        if req not in payload:
            missing.append(f"{req} ({desc})")
    
    if missing:
        print(f"Missing required claims: {', '.join(missing)}")
    else:
        print("All required claims are present")
    
    # Check algorithm (Supabase uses HS256 by default, Outseta uses RS256)
    token_parts = decode_token_parts(outseta_token)
    if token_parts and token_parts['header'].get('alg') != 'HS256':
        print(f"Algorithm mismatch: Token uses {token_parts['header'].get('alg')}, Supabase expects HS256")
    
    # Return the payload for further inspection
    return payload

def create_supabase_token(outseta_payload, supabase_secret):
    """Create a Supabase-compatible token from Outseta payload"""
    # Extract relevant user information
    now = int(time.time())
    
    # Create a payload that matches Supabase expectations
    supabase_payload = {
        "aud": "authenticated",
        "sub": outseta_payload.get("sub") or outseta_payload.get("email") or "",
        "role": "authenticated",
        "exp": outseta_payload.get("exp"),
        "iat": now,
        "email": outseta_payload.get("email", ""),
        "app_metadata": {
            "provider": "outseta"
        },
        "user_metadata": {
            "full_name": outseta_payload.get("name", ""),
            "outseta_id": outseta_payload.get("sub", "")
        }
    }
    
    # Sign with the Supabase secret using HS256
    try:
        supabase_token = jwt.encode(supabase_payload, supabase_secret, algorithm="HS256")
        return supabase_token
    except Exception as e:
        print(f"Error creating Supabase token: {e}")
        return None

def main():
    # Decode token parts for inspection
    token_parts = decode_token_parts(outseta_token)
    if token_parts:
        print("\n=== TOKEN HEADER ===")
        print(json.dumps(token_parts['header'], indent=2))
        print("\n=== TOKEN PAYLOAD ===")
        print(json.dumps(token_parts['payload'], indent=2))
    else:
        print("Failed to decode token")
        return
    
    # Verify the Outseta token
    print("\n=== VERIFYING OUTSETA TOKEN ===")
    success, result = verify_outseta_token(outseta_token, jwks_url)
    if success:
        print("Token verification succeeded")
        
        # Check for Supabase requirements
        print("\n=== CHECKING SUPABASE REQUIREMENTS ===")
        payload = check_for_supabase_requirements(result)
        
        # Create a Supabase-compatible token
        print("\n=== CREATING SUPABASE-COMPATIBLE TOKEN ===")
        supabase_token = create_supabase_token(payload, supabase_secret)
        if supabase_token:
            print("Supabase token created successfully")
            supabase_token_parts = decode_token_parts(supabase_token)
            if supabase_token_parts:
                print("\n=== SUPABASE TOKEN HEADER ===")
                print(json.dumps(supabase_token_parts['header'], indent=2))
                print("\n=== SUPABASE TOKEN PAYLOAD ===")
                print(json.dumps(supabase_token_parts['payload'], indent=2))
    else:
        print(f"Token verification failed: {result}")

if __name__ == "__main__":
    main()
