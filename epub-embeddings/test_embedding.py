# test_embedding.py
import requests
import numpy as np
from config import HUGGINGFACE_API_KEY, EMBEDDING_MODEL

def test_embedding_generation():
    print(f"Testing embedding generation with {EMBEDDING_MODEL}...")
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    # Test texts
    test_texts = [
        "This is a test paragraph to check if the embedding model works.",
        "Here's another sample text to verify embedding generation."
    ]
    
    try:
        print("Sending request to HuggingFace API for embedding generation...")
        
        # Define examples for in-context learning
        examples = [
            {
                'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
                'query': 'what is a virtual interface',
                'response': "A virtual interface is a software-defined abstraction that mimics the behavior and characteristics of a physical network interface."
            },
            {
                'instruct': 'Given a web search query, retrieve relevant passages that answer the query.',
                'query': 'causes of back pain in female for a week',
                'response': "Back pain in females lasting a week can stem from various factors."
            }
        ]
        
        # Format the examples for the ICL model
        examples_formatted = []
        for e in examples:
            examples_formatted.append(f"<instruct>{e['instruct']}\n<query>{e['query']}\n<response>{e['response']}")
        
        examples_prefix = '\n\n'.join(examples_formatted) + '\n\n'
        
        # Format queries for the ICL model
        formatted_queries = []
        for text in test_texts:
            task = 'Given a web search query, retrieve relevant passages that answer the query.'
            formatted_query = f"{examples_prefix}<instruct>{task}\n<query>{text}\n<response>"
            formatted_queries.append(formatted_query)
        
        print("\nTrying to get embeddings using the ICL model...")
        response1 = requests.post(
            API_URL,
            headers=HEADERS,
            json={
                "inputs": formatted_queries[0],
                "task_type": "feature-extraction"
            }
        )
        
        if response1.status_code == 200:
            embedding1 = response1.json()
            print(f"Successfully generated first embedding")
            
            # Get the second embedding
            response2 = requests.post(
                API_URL,
                headers=HEADERS,
                json={
                    "inputs": formatted_queries[1],
                    "task_type": "feature-extraction"
                }
            )
            
            if response2.status_code == 200:
                embedding2 = response2.json()
                print(f"Successfully generated both embeddings.")
                
                # If we got valid embeddings
                if embedding1 and embedding2:
                    # Convert to numpy arrays
                    embedding1_np = np.array(embedding1)
                    embedding2_np = np.array(embedding2)
                    
                    # Normalize embeddings
                    embedding1_np = embedding1_np / np.linalg.norm(embedding1_np)
                    embedding2_np = embedding2_np / np.linalg.norm(embedding2_np)
                    
                    # Calculate cosine similarity
                    similarity = np.dot(embedding1_np, embedding2_np)
                    print(f"Cosine similarity between test embeddings: {similarity}")
                
                return [embedding1, embedding2]
            else:
                print(f"Error generating second embedding: {response2.status_code} - {response2.text}")
        else:
            print(f"Error generating first embedding: {response1.status_code} - {response1.text}")
            return None
    
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None

if __name__ == "__main__":
    result = test_embedding_generation()
    print(f"Embedding generation test {'succeeded' if result else 'failed'}") 