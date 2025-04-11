# test_end_to_end.py
import os
import time
import json
import argparse
import requests
import numpy as np
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub
from config import (
    TURBOPUFFER_API_KEY, 
    SUPABASE_URL, 
    SUPABASE_KEY, 
    HUGGINGFACE_API_KEY, 
    EMBEDDING_MODEL, 
    MIN_PARAGRAPH_LENGTH, 
    EMBEDDING_DIMENSION
)

def extract_paragraphs(epub_path, max_paragraphs=None):
    """Extract paragraphs and metadata from an EPUB file"""
    print(f"\n=== STEP 1: EPUB PARSING ===")
    print(f"Parsing EPUB file: {epub_path}")
    
    try:
        book = epub.read_epub(epub_path)
        
        # Get book metadata
        book_title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "Unknown Title"
        book_author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "Unknown Author"
        
        print(f"Book: {book_title} by {book_author}")
        
        # Extract book structure
        all_paragraphs = []
        items = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
        
        # Sort items by spine order if available
        if book.spine:
            spine_ids = [item[0] for item in book.spine]
            items.sort(key=lambda x: spine_ids.index(x.get_id()) if x.get_id() in spine_ids else float('inf'))
        
        # Process each document (chapter)
        total_processed = 0
        
        for i, item in enumerate(items):
            chapter_content = item.get_content().decode('utf-8', errors='replace')
            
            # Try to extract chapter title from content
            soup = BeautifulSoup(chapter_content, 'html.parser')
            heading = soup.find(['h1', 'h2', 'h3', 'h4'])
            chapter_title = heading.get_text().strip() if heading else f"Chapter {i+1}"
            
            # Extract paragraphs from this chapter
            p_tags = soup.find_all(['p'])
            
            for p in p_tags:
                text = p.get_text().strip()
                
                # Only include paragraphs with meaningful content
                if len(text) >= MIN_PARAGRAPH_LENGTH:
                    all_paragraphs.append({
                        'text': text,
                        'metadata': {
                            'book_title': book_title,
                            'book_author': book_author,
                            'chapter_title': chapter_title,
                            'chapter_number': i+1,
                            'paragraph_number': total_processed + 1
                        }
                    })
                    total_processed += 1
                    
                    # Check if we've reached the maximum number of paragraphs
                    if max_paragraphs and total_processed >= max_paragraphs:
                        print(f"Reached maximum paragraphs limit ({max_paragraphs})")
                        break
            
            # Break if we've reached the maximum
            if max_paragraphs and total_processed >= max_paragraphs:
                break
        
        print(f"Extracted {len(all_paragraphs)} paragraphs from {len(items)} chapters")
        
        # Print sample paragraph
        if all_paragraphs:
            sample = all_paragraphs[0]
            print(f"\nSample paragraph from '{sample['metadata']['chapter_title']}':")
            print(f"  {sample['text'][:100]}...")
        
        return all_paragraphs, book_title, book_author
    
    except Exception as e:
        print(f"Error parsing EPUB: {e}")
        return None, None, None

def generate_embeddings(paragraphs):
    """Generate embeddings for a list of paragraphs"""
    print(f"\n=== STEP 2: EMBEDDING GENERATION ===")
    print(f"Generating embeddings with {EMBEDDING_MODEL}...")
    
    if not paragraphs:
        print("No paragraphs to process")
        return None
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    try:
        # Process paragraphs in batches to avoid timeouts
        batch_size = 5
        all_embeddings = []
        
        for i in range(0, len(paragraphs), batch_size):
            batch = paragraphs[i:i+batch_size]
            
            # For bge-large-en-v1.5, add the instruction prefix
            instruction = "Represent this sentence for searching relevant passages:"
            batch_texts = [f"{instruction} {p['text']}" for p in batch]
            
            print(f"Processing batch {i//batch_size + 1}/{(len(paragraphs)-1)//batch_size + 1} ({len(batch)} paragraphs)")
            
            response = requests.post(
                API_URL,
                headers=HEADERS,
                json={
                    "inputs": batch_texts,
                    "task_type": "feature-extraction"
                }
            )
            
            if response.status_code == 200:
                batch_embeddings = response.json()
                
                # Ensure we got the expected number of embeddings
                if len(batch_embeddings) != len(batch):
                    raise Exception(f"Expected {len(batch)} embeddings, got {len(batch_embeddings)}")
                
                # Combine paragraph data with embeddings
                for j, embedding in enumerate(batch_embeddings):
                    paragraphs[i+j]['embedding'] = embedding
                    all_embeddings.append(embedding)
                
                # Print sample embedding dimensions for the first batch
                if i == 0:
                    embedding_np = np.array(all_embeddings[0])
                    print(f"Generated embedding with dimensions: {embedding_np.shape}")
            else:
                raise Exception(f"Error {response.status_code}: {response.text}")
            
            # Add a small delay between batches to avoid rate limits
            if i + batch_size < len(paragraphs):
                time.sleep(1)
        
        print(f"Generated {len(all_embeddings)} embeddings")
        return paragraphs
    
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return None

def store_in_turbopuffer(paragraphs, book_title, book_author):
    """Store paragraphs and embeddings in TurboPuffer"""
    print(f"\n=== STEP 3: TURBOPUFFER STORAGE ===")
    
    if not paragraphs:
        print("No paragraphs to store")
        return None
    
    try:
        # Create a namespace with book info and timestamp to avoid conflicts
        namespace_name = f"book-{book_title.lower().replace(' ', '-')}-{int(time.time())}"
        namespace_name = namespace_name[:128]  # Ensure name is not too long
        print(f"Creating namespace: {namespace_name}")
        
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Create namespace
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'namespace',
                'namespace': namespace_name
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Error creating namespace: {response.status_code} - {response.text}")
        
        print("Namespace created successfully")
        
        # Prepare vectors for TurboPuffer
        vectors = []
        for i, p in enumerate(paragraphs):
            if 'embedding' not in p:
                print(f"Warning: Paragraph {i} has no embedding, skipping")
                continue
                
            vectors.append({
                "id": f"p{i}",
                "vector": p['embedding'],
                "attributes": {
                    "text": p['text'],
                    "book_title": book_title,
                    "book_author": book_author,
                    "chapter_title": p['metadata']['chapter_title'],
                    "chapter_number": p['metadata']['chapter_number'],
                    "paragraph_number": p['metadata']['paragraph_number']
                }
            })
        
        # Insert vectors in batches to avoid request size limits
        batch_size = 10
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i+batch_size]
            print(f"Upserting batch {i//batch_size + 1}/{(len(vectors)-1)//batch_size + 1} ({len(batch)} vectors)")
            
            upsert_response = requests.post(
                f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
                headers=headers,
                json={
                    'operation': 'upsert',
                    'namespace': namespace_name,
                    'vectors': batch,
                    'distance_metric': 'cosine_distance'
                }
            )
            
            if upsert_response.status_code != 200:
                raise Exception(f"Error upserting vectors: {upsert_response.status_code} - {upsert_response.text}")
            
            print(f"Batch {i//batch_size + 1} upserted successfully")
            
            # Add delay between batches
            if i + batch_size < len(vectors):
                time.sleep(1)
        
        print(f"Successfully stored {len(vectors)} vectors in namespace: {namespace_name}")
        return namespace_name
    
    except Exception as e:
        print(f"Error storing in TurboPuffer: {e}")
        return None

def test_vector_search(namespace_name, sample_text):
    """Test vector search functionality"""
    print(f"\n=== STEP 4: VECTOR SEARCH TEST ===")
    
    if not namespace_name or not sample_text:
        print("Missing namespace or sample text for search")
        return False
    
    try:
        # Generate embedding for the search text
        API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
        HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        
        # Add the instruction prefix for bge-large-en-v1.5
        instruction = "Represent this sentence for searching relevant passages:"
        search_text = f"{instruction} {sample_text}"
        
        print(f"Generating embedding for search query: '{sample_text}'")
        
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json={
                "inputs": search_text,
                "task_type": "feature-extraction"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Error generating search embedding: {response.status_code} - {response.text}")
        
        query_vector = response.json()
        
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Perform vector search
        print(f"Performing vector search in namespace: {namespace_name}")
        
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'vector': query_vector,
                'top_k': 3,
                'distance_metric': 'cosine_distance',
                'include_attributes': ['text', 'book_title', 'book_author', 'chapter_title']
            }
        )
        
        if query_response.status_code != 200:
            raise Exception(f"Error in vector search: {query_response.status_code} - {query_response.text}")
        
        results = query_response.json()
        print(f"Vector search successful, found {len(results)} results")
        
        # Print the top results
        for i, result in enumerate(results[:3]):
            print(f"\nResult {i+1} (Distance: {result['distance']:.4f}):")
            print(f"From: {result['attributes']['book_title']} by {result['attributes']['book_author']}")
            print(f"Chapter: {result['attributes']['chapter_title']}")
            print(f"Text: {result['attributes']['text'][:150]}...")
        
        return True
    
    except Exception as e:
        print(f"Error in vector search test: {e}")
        return False

def test_text_search(namespace_name, search_query):
    """Test full-text search functionality"""
    print(f"\n=== STEP 5: TEXT SEARCH TEST ===")
    
    if not namespace_name or not search_query:
        print("Missing namespace or search query")
        return False
    
    try:
        # Set headers for Supabase
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        # Perform text search
        print(f"Performing text search for '{search_query}' in namespace: {namespace_name}")
        
        query_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
            headers=headers,
            json={
                'operation': 'query',
                'namespace': namespace_name,
                'text': search_query,
                'top_k': 3,
                'include_attributes': ['text', 'book_title', 'book_author', 'chapter_title']
            }
        )
        
        if query_response.status_code != 200:
            raise Exception(f"Error in text search: {query_response.status_code} - {query_response.text}")
        
        results = query_response.json()
        print(f"Text search successful, found {len(results)} results")
        
        # Print the top results
        for i, result in enumerate(results[:3]):
            print(f"\nResult {i+1} (Score: {result.get('score', 'N/A')}):")
            print(f"From: {result['attributes']['book_title']} by {result['attributes']['book_author']}")
            print(f"Chapter: {result['attributes']['chapter_title']}")
            print(f"Text: {result['attributes']['text'][:150]}...")
        
        return True
    
    except Exception as e:
        print(f"Error in text search test: {e}")
        return False

def run_end_to_end_test(epub_path, max_paragraphs=20):
    """Run the complete end-to-end test"""
    print(f"Starting end-to-end test for: {epub_path}")
    print(f"Maximum paragraphs: {max_paragraphs}")
    
    # Step 1: Parse EPUB file
    paragraphs, book_title, book_author = extract_paragraphs(epub_path, max_paragraphs)
    
    if not paragraphs:
        print("Failed to extract paragraphs, aborting test")
        return False
    
    # Step 2: Generate embeddings
    paragraphs_with_embeddings = generate_embeddings(paragraphs)
    
    if not paragraphs_with_embeddings:
        print("Failed to generate embeddings, aborting test")
        return False
    
    # Step 3: Store in TurboPuffer
    namespace_name = store_in_turbopuffer(paragraphs_with_embeddings, book_title, book_author)
    
    if not namespace_name:
        print("Failed to store data in TurboPuffer, aborting test")
        return False
    
    # Step 4: Test vector search
    # Use the first paragraph as a sample for search testing
    sample_text = paragraphs[0]['text']
    vector_search_success = test_vector_search(namespace_name, sample_text)
    
    # Step 5: Test text search (using a keyword from the book)
    # Extract a meaningful word from the text to search for
    words = ' '.join([p['text'] for p in paragraphs[:5]]).split()
    search_words = [w for w in words if len(w) > 5][:3]  # Get a few longer words for the search
    search_query = ' '.join(search_words)
    text_search_success = test_text_search(namespace_name, search_query)
    
    # Final summary
    print("\n=== END-TO-END TEST SUMMARY ===")
    print(f"1. EPUB Parsing: {'✅ Success' if paragraphs else '❌ Failed'}")
    print(f"2. Embedding Generation: {'✅ Success' if paragraphs_with_embeddings else '❌ Failed'}")
    print(f"3. TurboPuffer Storage: {'✅ Success' if namespace_name else '❌ Failed'}")
    print(f"4. Vector Search: {'✅ Success' if vector_search_success else '❌ Failed'}")
    print(f"5. Text Search: {'✅ Success' if text_search_success else '❌ Failed'}")
    print(f"\nTest namespace: {namespace_name}")
    
    print("\nEnd-to-end test completed.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run end-to-end test for EPUB embedding and search')
    parser.add_argument('epub_path', help='Path to EPUB file')
    parser.add_argument('--max-paragraphs', type=int, help='Maximum number of paragraphs to process')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        run_end_to_end_test(args.epub_path, args.max_paragraphs) 