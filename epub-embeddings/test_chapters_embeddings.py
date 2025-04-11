# test_chapters_embeddings.py
import os
import time
import argparse
import requests
import numpy as np
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub
from config import HUGGINGFACE_API_KEY, EMBEDDING_MODEL, MIN_PARAGRAPH_LENGTH, TURBOPUFFER_API_KEY, SUPABASE_URL, SUPABASE_KEY
import traceback
import uuid
import json

# Import TurboPuffer modules - use the correct imports
import turbopuffer
from turbopuffer import namespace, namespaces, vectors

def extract_paragraphs_by_chapters(epub_path, num_chapters=3):
    """Extract paragraphs from the first n chapters of an EPUB file"""
    print("\n=== STEP 1: EPUB PARSING ===")
    print(f"Parsing EPUB file: {epub_path}")
    print(f"Extracting the first {num_chapters} chapters")
    
    try:
        # Read the EPUB file
        book = epub.read_epub(epub_path)
        
        # Get book metadata
        book_title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "Unknown Title"
        book_author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "Unknown Author"
        
        print(f"Book: {book_title} by {book_author}")
        
        # Extract content from items
        all_chapters = []
        paragraphs = []
        chapter_data = {}
        
        # First, examine the file structure
        print("Examining file structure:")
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                print(f"Document: {item.get_name()}")
        
        # Process the items in the book
        chapter_count = 0
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                soup = BeautifulSoup(item.get_content(), 'html.parser')
                
                # Try to find the chapter title - look for headings
                chapter_title = None
                for heading in soup.find_all(['h1', 'h2', 'h3', 'h4']):
                    if heading.text.strip():
                        chapter_title = heading.text.strip()
                        break
                
                # If no heading found, try to use the filename
                if not chapter_title:
                    chapter_title = item.get_name().split('/')[-1].replace('.html', '').replace('_', ' ').title()
                
                # Extract paragraphs
                chapter_paragraphs = []
                for p in soup.find_all('p'):
                    text = p.get_text().strip()
                    # Skip empty paragraphs and very short ones
                    if text and len(text) >= MIN_PARAGRAPH_LENGTH:
                        chapter_paragraphs.append({
                            'text': text,
                            'chapter': chapter_title,
                            'chapter_index': chapter_count
                        })
                
                if chapter_paragraphs:
                    print(f"Processed file: {item.get_name()} - {len(chapter_paragraphs)} paragraphs")
                    all_chapters.append(chapter_title)
                    paragraphs.extend(chapter_paragraphs)
                    chapter_data[chapter_title] = chapter_paragraphs
                    chapter_count += 1
                    
                    # If we've found enough chapters, stop
                    if chapter_count >= num_chapters and num_chapters > 0:
                        break
        
        # Check if we have enough content
        if len(paragraphs) < 5:
            print("WARNING: Very few paragraphs found. Trying alternative parsing method...")
            
            # Alternative approach - just get all paragraphs without worrying about chapters
            chapter_count = 0
            all_chapters = []
            paragraphs = []
            chapter_data = {}
            
            for item in book.get_items():
                if item.get_type() == ebooklib.ITEM_DOCUMENT:
                    soup = BeautifulSoup(item.get_content(), 'html.parser')
                    
                    # Create an artificial chapter name based on content
                    text_content = soup.get_text().strip()
                    if len(text_content) > 20:
                        # Use first 20 chars as chapter name if no better option
                        chapter_title = f"Section {chapter_count+1}: {text_content[:20]}..."
                        
                        # Extract all paragraphs
                        all_paragraphs = []
                        for element in soup.find_all(['p', 'div']):
                            text = element.get_text().strip()
                            if text and len(text) >= MIN_PARAGRAPH_LENGTH:
                                all_paragraphs.append({
                                    'text': text,
                                    'chapter': chapter_title,
                                    'chapter_index': chapter_count
                                })
                        
                        if all_paragraphs:
                            print(f"Alternative parsing - Section {chapter_count+1}: {len(all_paragraphs)} paragraphs")
                            all_chapters.append(chapter_title)
                            paragraphs.extend(all_paragraphs)
                            chapter_data[chapter_title] = all_paragraphs
                            chapter_count += 1
                            
                            # If we've found enough chapters, stop
                            if chapter_count >= num_chapters and num_chapters > 0:
                                break
        
        print(f"Extracted {len(paragraphs)} paragraphs from {len(chapter_data)} chapters")
        
        # Print a sample from each chapter
        for chapter in list(chapter_data.keys())[:num_chapters]:
            if chapter_data[chapter]:
                sample_text = chapter_data[chapter][0]['text']
                print(f"\nSample from '{chapter}':")
                print(f"  {sample_text[:100]}...")
        
        return paragraphs, all_chapters, book_title, book_author
    
    except Exception as e:
        print(f"Error parsing EPUB: {str(e)}")
        traceback.print_exc()
        return None, None, None, None

def generate_embedding(paragraph_text, backoff_factor=2):
    """Generate embedding for a single paragraph with unlimited retries for 503 errors"""
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    # Retry indefinitely with exponential backoff (capped)
    attempt = 0
    max_backoff = 60  # Cap the maximum wait time to 60 seconds
    
    while True:
        attempt += 1
        try:
            # For bge-large-en-v1.5, add the instruction prefix
            instruction = "Represent this sentence for searching relevant passages:"
            text_to_embed = f"{instruction} {paragraph_text}"
            
            response = requests.post(
                API_URL,
                headers=HEADERS,
                json={
                    "inputs": text_to_embed,
                    "task_type": "feature-extraction"
                },
                timeout=10  # Add timeout to prevent hanging
            )
            
            if response.status_code == 200:
                embedding = response.json()
                return embedding, None
            elif response.status_code == 503:
                # Service unavailable, retry after backoff
                wait_time = min(backoff_factor ** min(attempt, 5), max_backoff)  # Cap exponential growth
                error_msg = f"Service unavailable (503), retrying in {wait_time}s... (Attempt {attempt})"
                print(error_msg)
                time.sleep(wait_time)
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                return None, error_msg
        
        except requests.exceptions.Timeout:
            wait_time = min(backoff_factor ** min(attempt, 5), max_backoff)  # Cap exponential growth
            error_msg = f"Request timed out, retrying in {wait_time}s... (Attempt {attempt})"
            print(error_msg)
            time.sleep(wait_time)
        except Exception as e:
            error_msg = f"Error generating embedding: {str(e)}"
            return None, error_msg

def test_chapter_embeddings(paragraphs, chapters, book_title="Unknown Title", book_author="Unknown Author", store_in_turbopuffer=False, namespace_name=None):
    """Test generating embeddings for paragraphs, organized by chapter"""
    print(f"\n=== STEP 2: CHAPTER EMBEDDING GENERATION ===")
    print(f"Generating embeddings with {EMBEDDING_MODEL} organized by chapter...")
    
    if not paragraphs or not chapters:
        print("No paragraphs or chapters to process")
        return False, None
    
    all_embeddings = []
    total_success = 0
    total_failure = 0
    
    # Initialize TurboPuffer if storing embeddings
    if store_in_turbopuffer:
        if not namespace_name:
            namespace_name = f"epub-embedding-{int(time.time())}"
        
        print(f"\nInitializing TurboPuffer with namespace: {namespace_name}")
        try:
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
            
            print(f"✅ Successfully connected to TurboPuffer")
        except Exception as e:
            print(f"❌ Failed to connect to TurboPuffer: {str(e)}")
            store_in_turbopuffer = False
    
    start_time = time.time()
    
    # Process each chapter
    for chapter in chapters:
        chapter_start_time = time.time()
        
        # Get paragraphs for this chapter
        chapter_paragraphs = [p for p in paragraphs if p['chapter'] == chapter]
        
        print(f"\n--- PROCESSING CHAPTER: {chapter} ---")
        print(f"Chapter has {len(chapter_paragraphs)} paragraphs")
        
        chapter_success = 0
        chapter_failure = 0
        chapter_embeddings = []
        
        # Batch vectors for TurboPuffer
        batch_vectors = []
        
        # Process each paragraph in the chapter
        for i, paragraph in enumerate(chapter_paragraphs):
            print(f"Processing paragraph {i+1}/{len(chapter_paragraphs)}")
            print(f"Text: {paragraph['text'][:100]}...")
            
            # Generate embedding
            embedding, error = generate_embedding(paragraph['text'])
            
            if embedding:
                # Convert to numpy to get dimensions
                embedding_np = np.array(embedding)
                print(f"✅ Successfully generated embedding with shape: {embedding_np.shape}")
                
                # Store embedding with metadata
                embedding_data = {
                    'embedding': embedding,
                    'metadata': paragraph,
                    'text': paragraph['text']
                }
                chapter_embeddings.append(embedding_data)
                all_embeddings.append(embedding_data)
                
                # Store in TurboPuffer if enabled
                if store_in_turbopuffer:
                    try:
                        # Create a unique ID for the embedding
                        embedding_id = str(uuid.uuid4())
                        
                        # Prepare metadata
                        metadata = {
                            'text': paragraph['text'],
                            'chapter': paragraph['chapter'],
                            'chapter_index': paragraph['chapter_index'],
                            'book_title': book_title,
                            'book_author': book_author,
                            'paragraph_index': i
                        }
                        
                        # Add to batch
                        batch_vectors.append({
                            "id": embedding_id,
                            "vector": embedding,
                            "attributes": metadata
                        })
                        
                        # Process batch if it reaches a decent size or is the last item
                        if len(batch_vectors) >= 10 or i == len(chapter_paragraphs) - 1:
                            # Set headers for Supabase
                            headers = {
                                'Content-Type': 'application/json',
                                'Authorization': f'Bearer {SUPABASE_KEY}'
                            }
                            
                            # Store the batch
                            upsert_response = requests.post(
                                f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
                                headers=headers,
                                json={
                                    'operation': 'upsert',
                                    'namespace': namespace_name,
                                    'vectors': batch_vectors,
                                    'distance_metric': 'cosine_distance'
                                }
                            )
                            
                            # Check response
                            if upsert_response.status_code != 200:
                                print(f"❌ Failed to store batch in TurboPuffer: {upsert_response.status_code} - {upsert_response.text}")
                            else:
                                print(f"📦 Stored batch of {len(batch_vectors)} embeddings in TurboPuffer")
                            
                            # Clear the batch
                            batch_vectors = []
                    except Exception as e:
                        print(f"❌ Failed to store in TurboPuffer: {str(e)}")
                
                chapter_success += 1
                total_success += 1
            else:
                print(f"❌ Failed to generate embedding: {error}")
                chapter_failure += 1
                total_failure += 1
            
            # Add a small delay between requests
            if i < len(chapter_paragraphs) - 1:
                time.sleep(0.5)
        
        # Chapter summary
        chapter_time = time.time() - chapter_start_time
        paragraphs_per_minute = len(chapter_paragraphs) / (chapter_time / 60) if chapter_time > 0 else 0
        
        print(f"\n--- CHAPTER SUMMARY: {chapter} ---")
        print(f"Total paragraphs: {len(chapter_paragraphs)}")
        print(f"Successful embeddings: {chapter_success}")
        print(f"Failed embeddings: {chapter_failure}")
        print(f"Success rate: {chapter_success/len(chapter_paragraphs)*100:.2f}%")
        print(f"Processing rate: {paragraphs_per_minute:.2f} paragraphs/minute")
        print(f"Chapter processing time: {chapter_time/60:.2f} minutes")
    
    # Final summary
    total_time = time.time() - start_time
    total_paragraphs = total_success + total_failure
    paragraphs_per_minute = total_paragraphs / (total_time / 60) if total_time > 0 else 0
    
    print(f"\n=== OVERALL EMBEDDING GENERATION SUMMARY ===")
    print(f"Total chapters processed: {len(chapters)}")
    print(f"Total paragraphs processed: {total_paragraphs}")
    print(f"Successful embeddings: {total_success}")
    print(f"Failed embeddings: {total_failure}")
    print(f"Success rate: {total_success/total_paragraphs*100:.2f}%")
    print(f"Processing rate: {paragraphs_per_minute:.2f} paragraphs/minute")
    print(f"Total processing time: {total_time/60:.2f} minutes")
    
    if store_in_turbopuffer:
        print(f"\n=== TURBOPUFFER STORAGE SUMMARY ===")
        print(f"Namespace: {namespace_name}")
        print(f"Total embeddings stored: {total_success}")
        
        # Verify with a test query if we have stored embeddings
        if total_success > 0:
            try:
                print("\nVerifying storage with a test query...")
                # Set headers for Supabase
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                }
                
                # Use the first embedding as a test
                test_embedding = all_embeddings[0]['embedding']
                
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
                
                if query_response.status_code == 200:
                    query_result = query_response.json()
                    if query_result.get('success') and len(query_result.get('results', [])) > 0:
                        print("✅ Query returned results - storage confirmed!")
                    else:
                        print("⚠️ Query successful but no results returned")
                else:
                    print(f"⚠️ Query test failed: {query_response.status_code} - {query_response.text}")
            except Exception as e:
                print(f"⚠️ Failed to verify storage: {str(e)}")
    
    return total_success > 0, all_embeddings

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate embeddings for a specific number of chapters in an EPUB')
    parser.add_argument('epub_path', help='Path to EPUB file')
    parser.add_argument('--num-chapters', type=int, default=3, help='Number of chapters to process')
    parser.add_argument('--store-turbopuffer', action='store_true', help='Store embeddings in TurboPuffer')
    parser.add_argument('--namespace', type=str, help='TurboPuffer namespace to use')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        # Extract paragraphs from specified chapters
        paragraphs, chapters, book_title, book_author = extract_paragraphs_by_chapters(args.epub_path, args.num_chapters)
        
        if paragraphs and chapters:
            # Test embedding generation by chapter
            success, embeddings = test_chapter_embeddings(
                paragraphs, 
                chapters,
                book_title=book_title,
                book_author=book_author,
                store_in_turbopuffer=args.store_turbopuffer,
                namespace_name=args.namespace
            )
            
            if success:
                print(f"Successfully generated embeddings for {book_title} by {book_author}")
                print(f"Total embeddings generated: {len(embeddings)}")
            else:
                print("Failed to generate embeddings for the book") 