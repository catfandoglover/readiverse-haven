# test_embeddings.py
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
        print("Sending request to HuggingFace API...")
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json={"inputs": test_texts, "task_type": "feature-extraction"}
        )
        
        if response.status_code == 200:
            embeddings = response.json()
            
            # Print embedding information
            print(f"Successfully generated embeddings!")
            print(f"Number of embeddings: {len(embeddings)}")
            print(f"Embedding dimension: {len(embeddings[0])}")
            
            # Calculate similarity as verification
            embedding1 = np.array(embeddings[0])
            embedding2 = np.array(embeddings[1])
            
            # Normalize embeddings
            embedding1 = embedding1 / np.linalg.norm(embedding1)
            embedding2 = embedding2 / np.linalg.norm(embedding2)
            
            # Calculate cosine similarity
            similarity = np.dot(embedding1, embedding2)
            print(f"Cosine similarity between test embeddings: {similarity}")
            
            return embeddings
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None

if __name__ == "__main__":
    embeddings = test_embedding_generation()
    print(f"Embedding generation test {'succeeded' if embeddings else 'failed'}") 