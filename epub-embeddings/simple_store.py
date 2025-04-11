import requests
import numpy as np
import json
import uuid
from config import SUPABASE_URL, SUPABASE_KEY

def store_and_query_samples(namespace_name="alexandria_test"):
    """Store 3 sample embeddings and then query them back"""
    print(f"Storing and querying sample embeddings in namespace: {namespace_name}")
    
    # Set headers for Supabase
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    
    # Create 3 sample embeddings with fixed values so we can query them reliably
    samples = [
        {
            "id": str(uuid.uuid4()),
            "vector": np.ones(1024).tolist(),  # All ones
            "attributes": {
                "text": "This is sample 1 with all ones vector",
                "book_title": "Test Book",
                "book_author": "Test Author",
                "chapter": "Chapter 1"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "vector": np.zeros(1024).tolist(),  # All zeros
            "attributes": {
                "text": "This is sample 2 with all zeros vector",
                "book_title": "Test Book",
                "book_author": "Test Author",
                "chapter": "Chapter 2"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "vector": [0.5] * 1024,  # All 0.5
            "attributes": {
                "text": "This is sample 3 with all 0.5 vector",
                "book_title": "Test Book",
                "book_author": "Test Author",
                "chapter": "Chapter 3"
            }
        }
    ]
    
    # Store the samples
    print(f"Storing 3 sample embeddings...")
    upsert_response = requests.post(
        f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
        headers=headers,
        json={
            'operation': 'upsert',
            'namespace': namespace_name,
            'vectors': samples,
            'distance_metric': 'cosine_distance'
        }
    )
    
    print(f"Upsert response: {upsert_response.status_code}")
    print(f"Upsert content: {upsert_response.text}")
    
    if upsert_response.status_code != 200:
        print("Failed to store sample embeddings")
        return False
    
    print("\nNow querying the samples back...")
    
    # Try to query back the all-ones vector
    query_vector = np.ones(1024).tolist()
    
    query_response = requests.post(
        f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
        headers=headers,
        json={
            'operation': 'query',
            'namespace': namespace_name,
            'vector': query_vector,
            'top_k': 3,
            'distance_metric': 'cosine_distance',
            'include_attributes': ['text', 'book_title', 'book_author', 'chapter']
        }
    )
    
    print(f"Query response: {query_response.status_code}")
    
    if query_response.status_code == 200:
        try:
            result = query_response.json()
            total_results = len(result.get('results', []))
            print(f"Total results found: {total_results}")
            
            if total_results > 0:
                print("\n=== QUERIED EMBEDDINGS ===")
                for i, embedding in enumerate(result.get('results', [])):
                    attributes = embedding.get('attributes', {})
                    print(f"\n--- EMBEDDING {i+1} ---")
                    print(f"Book: {attributes.get('book_title', 'Unknown')} by {attributes.get('book_author', 'Unknown')}")
                    print(f"Chapter: {attributes.get('chapter', 'Unknown')}")
                    print(f"Text: {attributes.get('text', 'No text available')}")
                    print(f"Distance: {embedding.get('distance', 'Unknown')}")
            else:
                print("No embeddings found in query results")
        except json.JSONDecodeError:
            print("Could not parse JSON response")
    else:
        print(f"Query failed with response: {query_response.text}")
    
    return True

if __name__ == "__main__":
    store_and_query_samples() 