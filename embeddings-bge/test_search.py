import os
import requests
import json
from dotenv import load_dotenv
import traceback

# --- Import the embedding function ---
# Ensure embed_books.py is in the same directory or accessible via PYTHONPATH
try:
    from embed_books import generate_embeddings
except ImportError:
    print("Error: Could not import 'generate_embeddings' from 'embed_books.py'.")
    print("Make sure 'embed_books.py' is in the same directory.")
    exit(1)

# --- Configuration ---
load_dotenv()
TURBOPUFFER_API_KEY = os.getenv("TURBOPUFFER_API_KEY")
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY") # Needed for embedding the query

# --- Target Namespace for Searching ---
# --- Use the new namespace ---
TURBOPUFFER_NAMESPACE = "1984-test-embedding"
# --- End namespace change ---

# --- Turbopuffer API Endpoint ---
API_BASE_URL = "https://api.turbopuffer.com/v1"


def search_turbopuffer(query_text, namespace, api_key, hf_key, top_k=5):
    """
    Embeds a query and searches for similar vectors in Turbopuffer.

    Args:
        query_text (str): The natural language query.
        namespace (str): The Turbopuffer namespace to search.
        api_key (str): Turbopuffer API key.
        hf_key (str): Hugging Face API key (for embedding the query).
        top_k (int): The number of top results to retrieve.

    Returns:
        list: A list of result dictionaries, or None if an error occurs.
    """
    if not api_key:
        print("Error: TURBOPUFFER_API_KEY not found in .env file.")
        return None
    if not hf_key:
        print("Error: HUGGINGFACE_API_KEY not found in .env file (needed for query embedding).")
        return None

    print(f"Embedding query: '{query_text}'")
    # --- Embed the query using the SAME function ---
    # generate_embeddings expects a list and returns a list
    query_embedding_list = generate_embeddings([query_text], hf_key)

    if not query_embedding_list or query_embedding_list[0] is None:
        print("Error: Failed to generate embedding for the query.")
        return None

    query_vector = query_embedding_list[0]
    print(f"Query embedded successfully (vector dimension: {len(query_vector)}).")

    # --- Prepare Turbopuffer Query ---
    search_url = f"{API_BASE_URL}/vectors/{namespace}/query"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "vector": query_vector,
        "top_k": top_k,
        "distance_metric": "cosine_distance",
        "include_attributes": True,
        "include_vector": False # Usually don't need the vector itself back
    }

    print(f"Searching namespace '{namespace}' for top {top_k} results...")

    try:
        response = requests.post(search_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

        results = response.json()
        print("Search successful.")
        return results

    except requests.exceptions.RequestException as e:
        print(f"Error during Turbopuffer search request: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"  Error Response Status: {e.response.status_code}")
             print(f"  Error Response Body: {e.response.text[:500]}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON response from Turbopuffer search.")
        print(f"  Response Text: {response.text[:500]}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during search: {e}")
        return None


if __name__ == "__main__":
    print("--- Turbopuffer Semantic Search Test ---")
    print(f"Target Namespace: {TURBOPUFFER_NAMESPACE}")

    while True:
        try:
            query = input("\nEnter your search query (or type 'quit' to exit): ")
            if query.lower() == 'quit':
                break
            if not query:
                continue

            num_results_str = input(f"How many results do you want? (default: 5): ")
            try:
                top_k = int(num_results_str) if num_results_str else 5
            except ValueError:
                print("Invalid number, using default 5.")
                top_k = 5

            search_results = search_turbopuffer(
                query_text=query,
                namespace=TURBOPUFFER_NAMESPACE,
                api_key=TURBOPUFFER_API_KEY,
                hf_key=HF_API_KEY,
                top_k=top_k
            )

            if search_results:
                print("\n--- Search Results ---")
                if not search_results:
                     print("No results found.")
                else:
                    for i, result in enumerate(search_results):
                        similarity = 1 - (result.get('dist', 1))

                        print(f"\n{i+1}. ID: {result.get('id', 'N/A')}")
                        print(f"   Similarity: {similarity:.4f} (Distance: {result.get('dist', 'N/A'):.4f})")
                        attributes = result.get('attributes', {})
                        if attributes:
                            print(f"   Book: {attributes.get('book_title', 'N/A')} ({attributes.get('book_author', 'N/A')})")
                            print(f"   UUID: {attributes.get('book_uuid', 'N/A')}")
                            print(f"   Chapter: {attributes.get('chapter_number', 'N/A')} - {attributes.get('chapter_title', 'N/A')}")
                            print(f"   Paragraph: {attributes.get('paragraph_number', 'N/A')}")
                            print(f"   Text: {attributes.get('paragraph_text', 'N/A')}")
                        else:
                            print("   Attributes: None")
                print("----------------------")

        except KeyboardInterrupt:
            print("\nExiting.")
            break
        except Exception as e:
            print(f"\nAn unexpected error occurred in the main loop: {e}")
            traceback.print_exc() # Use traceback for unexpected errors 
