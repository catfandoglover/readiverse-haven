import requests
import json
import argparse
from config import SUPABASE_URL, SUPABASE_KEY

def list_turbopuffer_namespaces():
    """List all TurboPuffer namespaces"""
    print("Listing all TurboPuffer namespaces...")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Request the list of namespaces
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'list_namespaces'
            }
        )
        
        # Check response
        if response.status_code != 200:
            raise Exception(f"Error listing namespaces: {response.status_code} - {response.text}")
        
        result = response.json()
        
        # Display the namespaces
        print("\n=== TURBOPUFFER NAMESPACES ===")
        if result.get('namespaces'):
            for i, namespace in enumerate(result.get('namespaces', [])):
                print(f"{i+1}. {namespace}")
        else:
            print("No namespaces found")
        
        return True
    
    except Exception as e:
        print(f"❌ Failed to list namespaces: {str(e)}")
        return False

if __name__ == "__main__":
    list_turbopuffer_namespaces() 