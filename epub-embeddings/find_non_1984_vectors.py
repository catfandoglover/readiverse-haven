import requests
import json
import sys
import argparse
from config import SUPABASE_URL, SUPABASE_KEY

def find_non_1984_vectors(namespace_name):
    """Find vectors in a namespace that are not from 1984 by George Orwell"""
    print(f"Searching for non-1984 vectors in namespace: {namespace_name}")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY
        }
        
        # Get test embedding to confirm namespace exists
        test_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'test_query',
                'namespace': namespace_name
            }
        )
        
        if test_response.status_code != 200:
            print(f"Error accessing namespace: {test_response.status_code} - {test_response.text}")
            return False
        
        print(f"Namespace {namespace_name} is accessible.")
        
        # We'll try three different approaches:
        
        # 1. Look for vectors with content_type field
        content_type_query = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'k': 20,
                'filter': {
                    'content_type': {'exists': True}
                },
                'include_metadata': True
            }
        )
        
        print("\n=== QUERY FOR CONTENT_TYPE ===")
        print(f"Response: {content_type_query.status_code}")
        print(f"Content: {content_type_query.text[:500]}..." if len(content_type_query.text) > 500 else f"Content: {content_type_query.text}")
        
        # 2. Look for vectors that don't have book_title = "1984"
        title_query = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'k': 20,
                'filter': {
                    'book_title': {'not_eq': "1984"}
                },
                'include_metadata': True
            }
        )
        
        print("\n=== QUERY FOR NON-1984 BOOK_TITLE ===")
        print(f"Response: {title_query.status_code}")
        print(f"Content: {title_query.text[:500]}..." if len(title_query.text) > 500 else f"Content: {title_query.text}")
        
        # 3. Look for vectors with name field (likely from icons)
        name_query = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'k': 20,
                'filter': {
                    'name': {'exists': True}
                },
                'include_metadata': True
            }
        )
        
        print("\n=== QUERY FOR NAME FIELD ===")
        print(f"Response: {name_query.status_code}")
        print(f"Content: {name_query.text[:500]}..." if len(name_query.text) > 500 else f"Content: {name_query.text}")
        
        # 4. Simple test vector query without filtering
        simple_query = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'k': 5,
                'include_metadata': True
            }
        )
        
        print("\n=== SIMPLE QUERY WITHOUT FILTERING ===")
        print(f"Response: {simple_query.status_code}")
        print(f"Content: {simple_query.text[:500]}..." if len(simple_query.text) > 500 else f"Content: {simple_query.text}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Find non-1984 vectors in a namespace')
    parser.add_argument('namespace', help='Namespace to search')
    
    args = parser.parse_args()
    find_non_1984_vectors(args.namespace) 