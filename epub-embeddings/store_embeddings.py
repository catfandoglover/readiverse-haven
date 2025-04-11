import requests
import time
import json
import numpy as np
import uuid
import argparse
from config import TURBOPUFFER_API_KEY, SUPABASE_URL, SUPABASE_KEY

def store_test_embedding(namespace_name):
    """Store a test embedding in TurboPuffer via Supabase Edge Function"""
    print(f"Initializing TurboPuffer with namespace: {namespace_name}")
    
    try:
        # Create a test embedding
        embedding_id = str(uuid.uuid4())
        test_embedding = np.random.rand(1024).tolist()  # Create a random 1024-dim vector
        metadata = {
            'text': "This is a test embedding for 1984 by George Orwell",
            'book_title': "1984",
            'book_author': "George Orwell",
            'test': True
        }
        
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # First ensure the namespace exists
        print(f"Creating namespace: {namespace_name}...")
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'namespace',
                'namespace': namespace_name
            }
        )
        
        # Check response
        if response.status_code != 200:
            print(f"Note about namespace: {response.status_code} - {response.text}")
            if "already exists" not in response.text:
                raise Exception(f"Error creating namespace: {response.status_code} - {response.text}")
        else:
            namespace_result = response.json()
            print(f"Namespace created/confirmed: {namespace_result}")
        
        # Prepare vector for upsert
        vectors = [
            {
                "id": embedding_id,
                "vector": test_embedding,
                "attributes": metadata
            }
        ]
        
        # Store the embedding
        print(f"Storing test embedding in namespace: {namespace_name}")
        upsert_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'upsert',
                'namespace': namespace_name,
                'vectors': vectors,
                'distance_metric': 'cosine_distance'
            }
        )
        
        # Check upsert response
        if upsert_response.status_code != 200:
            raise Exception(f"Error upserting vectors: {upsert_response.status_code} - {upsert_response.text}")
        
        upsert_result = upsert_response.json()
        print(f"✅ Successfully stored test embedding with ID: {embedding_id}")
        print(f"✅ Namespace {namespace_name} is now ready for use")
        
        # Verify with a test query
        print("Testing with a query...")
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'vector': test_embedding,
                'top_k': 1,
                'distance_metric': 'cosine_distance',
                'include_attributes': ['text', 'book_title', 'book_author']
            }
        )
        
        # Check query response
        if query_response.status_code != 200:
            print(f"Warning - query issue: {query_response.status_code} - {query_response.text}")
        else:
            query_result = query_response.json()
            print(f"Query successful: {json.dumps(query_result, indent=2)}")
            
        return True
    
    except Exception as e:
        print(f"❌ Failed to store embedding: {str(e)}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Store a test embedding in TurboPuffer')
    parser.add_argument('namespace', help='Namespace to use')
    
    args = parser.parse_args()
    store_test_embedding(args.namespace) 