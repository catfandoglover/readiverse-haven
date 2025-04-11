import requests
import json
import numpy as np
import argparse
from config import SUPABASE_URL, SUPABASE_KEY

def query_random_embeddings(namespace_name, num_results=3):
    """Query random embeddings from a TurboPuffer namespace"""
    print(f"Querying random embeddings from namespace: {namespace_name}")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY
        }
        
        # Create a random query vector to find diverse results
        random_vector = np.random.rand(1024).tolist()
        
        # Query with a large top_k to get a variety of results
        print(f"Sending query to fetch diverse embeddings...")
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'vector': random_vector,
                'top_k': 50,  # Request more to ensure we get some results
                'distance_metric': 'cosine_distance',
                'include_attributes': ['text', 'book_title', 'book_author', 'chapter']
            }
        )
        
        # Check response
        if query_response.status_code != 200:
            raise Exception(f"Error querying vectors: {query_response.status_code} - {query_response.text}")
        
        query_result = query_response.json()
        
        if not query_result.get('success') or not query_result.get('results'):
            print("No results found in the namespace")
            return False
        
        # Get the results
        results = query_result.get('results', [])
        print(f"Found {len(results)} embeddings in the namespace")
        
        # If we have more results than requested, select random ones
        if len(results) > num_results:
            import random
            selected_results = random.sample(results, num_results)
        else:
            selected_results = results[:num_results]
        
        # Display the selected results
        print(f"\n=== {len(selected_results)} RANDOM EMBEDDINGS FROM {namespace_name} ===")
        for i, result in enumerate(selected_results):
            attributes = result.get('attributes', {})
            print(f"\n--- EMBEDDING {i+1} ---")
            print(f"Book: {attributes.get('book_title', 'Unknown')} by {attributes.get('book_author', 'Unknown')}")
            print(f"Chapter: {attributes.get('chapter', 'Unknown')}")
            text = attributes.get('text', 'No text available')
            print(f"Text: {text[:200]}..." if len(text) > 200 else f"Text: {text}")
            print(f"Distance: {result.get('distance', 'Unknown')}")
        
        return True
    
    except Exception as e:
        print(f"❌ Failed to query embeddings: {str(e)}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Query random embeddings from a TurboPuffer namespace')
    parser.add_argument('namespace', help='Namespace to query')
    parser.add_argument('--count', type=int, default=3, help='Number of random embeddings to retrieve')
    
    args = parser.parse_args()
    query_random_embeddings(args.namespace, args.count) 