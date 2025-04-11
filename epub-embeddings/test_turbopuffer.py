# test_turbopuffer.py
import requests
import time
import json
from config import TURBOPUFFER_API_KEY, SUPABASE_URL, SUPABASE_KEY

def test_turbopuffer_connection():
    print("Testing TurboPuffer connectivity...")
    print(f"Using Supabase URL: {SUPABASE_URL}")
    
    try:
        # Create a test namespace with timestamp to avoid conflicts
        namespace_name = f"test-connection-{int(time.time())}"
        print(f"Testing with namespace: {namespace_name}")
        
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Make a request to the turbopuffer-api function to create a namespace
        print("Creating namespace...")
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
            raise Exception(f"Error creating namespace: {response.status_code} - {response.text}")
        
        namespace_result = response.json()
        print(f"Namespace created: {namespace_result}")
        
        # Test vectors
        vectors = [
            {
                "id": "test1",
                "vector": [0.1, 0.2, 0.3, 0.4],
                "attributes": {
                    "text": "This is a test"
                }
            },
            {
                "id": "test2",
                "vector": [0.2, 0.3, 0.4, 0.5],
                "attributes": {
                    "text": "This is another test"
                }
            }
        ]
        
        # Upsert test data
        print("Upserting vectors...")
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
        print(f"Upsert successful: {upsert_result}")
        
        # Test query
        print("Querying vectors...")
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'vector': [0.1, 0.2, 0.3, 0.4],
                'top_k': 2,
                'distance_metric': 'cosine_distance',
                'include_attributes': ['text']
            }
        )
        
        # Check query response
        if query_response.status_code != 200:
            raise Exception(f"Error querying vectors: {query_response.status_code} - {query_response.text}")
            
        query_result = query_response.json()
        print(f"Query successful: {json.dumps(query_result, indent=2)}")
        
        # Instead of deleting, try the test query operation which is simpler
        print("Testing test_query operation...")
        test_query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'test_query',
                'namespace': namespace_name
            }
        )
        
        # Check test query response
        if test_query_response.status_code != 200:
            raise Exception(f"Error with test query: {test_query_response.status_code} - {test_query_response.text}")
            
        test_result = test_query_response.json()
        print(f"Test query successful: {json.dumps(test_result, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"Error testing TurboPuffer: {e}")
        print(f"Error type: {type(e)}")
        return False

if __name__ == "__main__":
    success = test_turbopuffer_connection()
    print(f"TurboPuffer test {'succeeded' if success else 'failed'}") 