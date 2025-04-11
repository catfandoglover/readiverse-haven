import requests
import json
import numpy as np
import argparse
from config import SUPABASE_URL, SUPABASE_KEY

def inspect_namespace(namespace_name):
    """Inspect a TurboPuffer namespace to see its content"""
    print(f"Inspecting namespace: {namespace_name}")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY
        }
        
        # First, try to test if the namespace exists
        test_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'test_query',
                'namespace': namespace_name
            }
        )
        
        print(f"Test query response: {test_response.status_code}")
        print(f"Test query content: {test_response.text}")
        
        # Try querying with a fixed vector and content_type filter to see if we get actual vectors
        # Use a vector of all 0.5s which should find something regardless of content
        fixed_vector = [0.5] * 1024
        
        filter_query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'vector': fixed_vector,
                'top_k': 10,
                'distance_metric': 'cosine_distance',
                'include_attributes': ['id', 'name', 'content_type', 'embedding_source', 'text', 'book_title', 'book_author']
            }
        )
        
        print(f"\nFilter query response: {filter_query_response.status_code}")
        print(f"Filter query content: {filter_query_response.text[:500]}..." if len(filter_query_response.text) > 500 else f"Filter query content: {filter_query_response.text}")
        
        # This will at least tell us if the namespace exists and is accessible
        if test_response.status_code == 200:
            try:
                result = test_response.json()
                if result.get('success'):
                    print(f"\n✅ Namespace {namespace_name} exists and is accessible.")
                    
                    # Check if we got any results from the filter query
                    if filter_query_response.status_code == 200:
                        filter_result = filter_query_response.json()
                        if filter_result.get('success') and filter_result.get('results'):
                            results = filter_result.get('results', [])
                            print(f"\n✅ Found {len(results)} actual vectors with content_type=icon")
                            
                            # Display some examples
                            for i, result in enumerate(results[:3]):
                                print(f"\n--- Icon {i+1} ---")
                                attrs = result.get('attributes', {})
                                for key, value in attrs.items():
                                    if isinstance(value, str) and len(value) > 100:
                                        value = value[:100] + "..."
                                    print(f"{key}: {value}")
                        else:
                            print(f"\n❌ No vectors found with content_type=icon")
                    else:
                        print(f"\n❌ Filter query failed with status: {filter_query_response.status_code}")
                    
                    # Since the test_query operation returns mock data, we can't tell if there are actual vectors
                    print("\nNote: The test_query operation returns mock data, not actual vectors in the namespace.")
                else:
                    print(f"\n❌ Namespace {namespace_name} test query returned an error: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"\n❌ Error parsing test query response: {str(e)}")
        else:
            print(f"\n❌ Namespace {namespace_name} is not accessible. Status code: {test_response.status_code}")
        
        return True
    
    except Exception as e:
        print(f"❌ Failed to inspect namespace: {str(e)}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Inspect a TurboPuffer namespace')
    parser.add_argument('namespace', help='Namespace to inspect')
    
    args = parser.parse_args()
    inspect_namespace(args.namespace) 