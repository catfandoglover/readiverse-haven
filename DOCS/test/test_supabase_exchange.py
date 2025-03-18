import json
import requests
import sys

# Configuration
SUPABASE_EXCHANGE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/exchange"

def test_token_exchange(outseta_token, use_header=True):
    """Test the token exchange with the Supabase Function"""
    print(f"\n=== TESTING SUPABASE TOKEN EXCHANGE API ===")
    print(f"Using {'Authorization header' if use_header else 'request body'} to send token")
    
    # Important: Make sure we use the right format for Content-Type
    headers = {
        "Content-Type": "application/json",
        # Add additional headers that may help with CORS and Edge Function access
        "x-client-info": "test-script"
    }
    
    # Add token to Authorization header or request body
    payload = {}
    if use_header:
        headers["Authorization"] = f"Bearer {outseta_token}"
        print(f"Using Authorization header with Bearer token")
    else:
        payload = {"token": outseta_token}
        print(f"Using request body with token field")
    
    # Show request details
    print(f"\nRequest URL: {SUPABASE_EXCHANGE_URL}")
    print(f"Request headers: {json.dumps(headers, indent=2)}")
    if payload:
        # Only show the first few characters of the token to avoid a very long output
        if "token" in payload and len(payload["token"]) > 20:
            display_payload = payload.copy()
            display_payload["token"] = f"{payload['token'][:20]}... (truncated)"
        else:
            display_payload = payload
        print(f"Request payload: {json.dumps(display_payload, indent=2)}")
    
    # Make the request
    try:
        response = requests.post(
            SUPABASE_EXCHANGE_URL,
            headers=headers,
            json=payload if payload else None
        )
        
        # Show response details
        print(f"\nResponse status: {response.status_code}")
        print(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
        
        # Try to parse response as JSON
        try:
            response_json = response.json()
            
            # If it's a successful response with a token, only show token prefix
            if response.status_code == 200 and "token" in response_json:
                display_json = response_json.copy()
                display_json["token"] = f"{response_json['token'][:20]}... (truncated)"
                print(f"Response body: {json.dumps(display_json, indent=2)}")
            else:
                print(f"Response body: {json.dumps(response_json, indent=2)}")
            
            # Check if token was returned
            if response.status_code == 200 and "token" in response_json:
                print("\n=== SUCCESS: TOKEN EXCHANGED SUCCESSFULLY ===")
                print(f"Supabase token received, length: {len(response_json['token'])}")
                if "user" in response_json:
                    print(f"User info: {json.dumps(response_json['user'], indent=2)}")
                return True
            else:
                print("\n=== ERROR: TOKEN EXCHANGE FAILED ===")
                if "error" in response_json:
                    print(f"Error: {response_json['error']}")
                    if "details" in response_json:
                        print(f"Details: {response_json['details']}")
                return False
        except Exception as e:
            print(f"Response could not be parsed as JSON: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n=== ERROR: REQUEST FAILED ===")
        print(f"Error: {str(e)}")
        return False

def main():

    
    # Get token from command line or use the sample token
    outseta_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCIsImtpZCI6Ik9Qb3JhQmtpTlc5UndHTno5SW5JZEV5NWJPMCJ9.eyJuYmYiOjE3NDIyNjM1NjMsImV4cCI6MTc0NzQ0NzU2MywiaXNzIjoiaHR0cHM6Ly9saWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImNsaWVudF9pZCI6ImxpZ2h0bmluZ2luc3BpcmF0aW9uLm91dHNldGEuY29tLnJlc291cmNlLW93bmVyIiwic2NvcGUiOlsib3BlbmlkIiwib3V0c2V0YSIsInByb2ZpbGUiXSwic3ViIjoieTlnWUo2R20iLCJhdXRoX3RpbWUiOjE3NDIyNjM1NjMsImlkcCI6Imlkc3J2IiwiZW1haWwiOiJwZ2FsZWJhY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZhbWlseV9uYW1lIjoiR2FsZWJhY2giLCJnaXZlbl9uYW1lIjoiUGhpbGlwIiwibmFtZSI6IlBoaWxpcCBHYWxlYmFjaCIsIm5hbWVpZCI6Ink5Z1lKNkdtIiwib3V0c2V0YTphY2NvdW50VWlkIjoieG1lWUF2d20iLCJvdXRzZXRhOmlzUHJpbWFyeSI6IjEiLCJvdXRzZXRhOnN1YnNjcmlwdGlvblVpZCI6InJtMEVOZWpRIiwib3V0c2V0YTpwbGFuVWlkIjoieVdvR1I4V0QiLCJvdXRzZXRhOmFkZE9uVWlkcyI6W10sImFtciI6WyJwYXNzd29yZCJdLCJhdWQiOiJsaWdodG5pbmdpbnNwaXJhdGlvbi5vdXRzZXRhLmNvbSIsImlhdCI6MTc0MjI2MzU2M30.CQAHDC2iP9NRtWOk9Rbuyj4MrXXaBhQUAEL7uuu-nAZCCwAlJMKQ3wzrT9zII8rfVNA9RBvLZZe3hCQTmrhNaxPzj-I65yXY5cFwbE2mZdAbmXBeRUfnbRAjcaetbZJyO_GFsSf_9w3AQKYFtqev4uEPW8hR1TvTfuRWThtm8bEjuxKjb0PNQGmffoWRA8tVWel3Zv6HCtaHC2i9h_LCSdg3SUxWpYab3EFn3pO8-bLXKoSBTIZkGtjMETDK4qiw8vzt-qd3ggSG2qsPfOVnskDEHtwmAKEyf9bQCIzxeCWwmVnki7UakOv6rPy2ABANRw3-D5gd_dVAJwX0NYswKw"
        
    method = "header"
    if len(sys.argv) > 2:
        method = sys.argv[2].lower()
    
    use_header = method != "body"
    
    # Test token exchange
    test_token_exchange(outseta_token, use_header)
    
    # If the first method fails, try the other method
    if method == "header":
        print("\n\nTrying with request body instead...")
        test_token_exchange(outseta_token, False)
    elif method == "body":
        print("\n\nTrying with Authorization header instead...")
        test_token_exchange(outseta_token, True)

if __name__ == "__main__":
    main() 
