import requests
import json
import numpy as np
import argparse
import time
import sys
from config import SUPABASE_URL, SUPABASE_KEY, HUGGINGFACE_API_KEY, EMBEDDING_MODEL

def get_embedding(text, max_retries=5, retry_delay=2):
    """Get embedding from Hugging Face API with retry logic"""
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}"
    }
    
    api_url = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json={"inputs": text}
            )
            
            if response.status_code == 503:
                retry_after = int(response.headers.get('Retry-After', retry_delay))
                print(f"Rate limited. Waiting {retry_after}s before retry {attempt+1}/{max_retries}")
                time.sleep(retry_after)
                continue
                
            if response.status_code != 200:
                print(f"Error status {response.status_code}: {response.text}")
                time.sleep(retry_delay)
                continue
                
            # Parse the response
            embedding = response.json()
            
            # Handle different response formats
            if isinstance(embedding, list) and len(embedding) > 0:
                # If it's a list of lists (standard format)
                if isinstance(embedding[0], list):
                    return embedding[0]
                # If it's a list of floats (single vector)
                elif isinstance(embedding[0], float):
                    return embedding
            # If it's a dictionary with embeddings
            elif isinstance(embedding, dict) and 'embeddings' in embedding:
                embed_array = embedding['embeddings']
                if isinstance(embed_array, list) and len(embed_array) > 0:
                    return embed_array[0] if isinstance(embed_array[0], list) else embed_array
            
            # If we reached here, the format wasn't recognized
            print(f"Unexpected response format: {type(embedding)}")
            print(f"Response sample: {str(embedding)[:100]}...")
            time.sleep(retry_delay)
            continue
                
        except Exception as e:
            print(f"Exception: {str(e)}")
            time.sleep(retry_delay)
    
    raise Exception(f"Failed to get embedding after {max_retries} attempts")

def query_discover_embeddings(namespace_name, query_text, content_type=None, limit=5):
    """Query discover feed embeddings from TurboPuffer using semantic search"""
    print(f"Querying discover feed embeddings from namespace: {namespace_name}")
    print(f"Query: '{query_text}'")
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY
        }
        
        # Get embedding for the query text
        query_embedding = get_embedding(query_text)
        
        # Convert embedding to simple list of floats
        query_embedding = [float(x) for x in query_embedding]
        
        # Print a sample of the vector to help debug
        print(f"Query vector format: {type(query_embedding)}, first 5 elements: {query_embedding[:5]}")
        
        # Prepare the query
        query_params = {
            'operation': 'query',
            'namespace': namespace_name,
            'vector': query_embedding,
            'top_k': limit,
            'distance_metric': 'cosine_distance',
            'include_attributes': ['id', 'name', 'illustration', 'about', 'slug', 'content_type']
        }
        
        # Add filter if content_type is specified
        if content_type:
            query_params['filter'] = {
                'content_type': {
                    'eq': content_type
                }
            }
        
        # Execute the query
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json=query_params
        )
        
        # Check response
        if query_response.status_code != 200:
            raise Exception(f"Error querying vectors: {query_response.status_code} - {query_response.text}")
        
        query_result = query_response.json()
        
        if not query_result.get('success') or not query_result.get('results'):
            print("No results found matching your query")
            return False
        
        # Get the results
        results = query_result.get('results', [])
        print(f"Found {len(results)} relevant embeddings")
        
        # Display the results
        print(f"\n=== TOP {len(results)} MATCHES FOR '{query_text}' ===")
        for i, result in enumerate(results):
            attributes = result.get('attributes', {})
            print(f"\n--- RESULT {i+1} (Distance: {result.get('distance', 'Unknown')}) ---")
            print(f"Name: {attributes.get('name', 'Unknown')}")
            print(f"Type: {attributes.get('content_type', 'Unknown')}")
            print(f"Slug: {attributes.get('slug', 'Unknown')}")
            
            about = attributes.get('about', 'No description available')
            print(f"About: {about[:150]}..." if len(about) > 150 else f"About: {about}")
            
            print(f"Illustration: {attributes.get('illustration', 'No image')}")
        
        return True
    
    except Exception as e:
        print(f"❌ Failed to query embeddings: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Query discover feed embeddings')
    parser.add_argument('query', help='Search query')
    parser.add_argument('--namespace', default="alexandria_test", help='TurboPuffer namespace to query')
    parser.add_argument('--content-type', help='Filter by content type (e.g., icon, concept)')
    parser.add_argument('--limit', type=int, default=5, help='Maximum number of results to display')
    
    args = parser.parse_args()
    query_discover_embeddings(args.namespace, args.query, args.content_type, args.limit)

if __name__ == "__main__":
    main() 