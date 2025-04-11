# test_full_book_embeddings.py
import os
import time
import argparse
import requests
import numpy as np
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub
from config import HUGGINGFACE_API_KEY, EMBEDDING_MODEL, MIN_PARAGRAPH_LENGTH

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
        
        # Print first and last paragraph as samples
        if all_paragraphs:
            first = all_paragraphs[0]
            print(f"\nFirst paragraph from '{first['metadata']['chapter_title']}':")
            print(f"  {first['text'][:150]}...")
            
            if len(all_paragraphs) > 1:
                last = all_paragraphs[-1]
                print(f"\nLast paragraph from '{last['metadata']['chapter_title']}':")
                print(f"  {last['text'][:150]}...")
        
        return all_paragraphs, book_title, book_author
    
    except Exception as e:
        print(f"Error parsing EPUB: {e}")
        return None, None, None

def generate_embedding(paragraph_text, retry_count=3, backoff_factor=2):
    """Generate embedding for a single paragraph with retry logic"""
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    # Retry with exponential backoff
    for attempt in range(retry_count):
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
                wait_time = backoff_factor ** attempt
                error_msg = f"Service unavailable (503), retrying in {wait_time}s... (Attempt {attempt+1}/{retry_count})"
                time.sleep(wait_time)
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                return None, error_msg
        
        except requests.exceptions.Timeout:
            wait_time = backoff_factor ** attempt
            error_msg = f"Request timed out, retrying in {wait_time}s... (Attempt {attempt+1}/{retry_count})"
            time.sleep(wait_time)
        except Exception as e:
            error_msg = f"Error generating embedding: {str(e)}"
            return None, error_msg
    
    # If we exhaust all retries
    return None, f"Failed after {retry_count} attempts"

def test_full_book_embeddings(paragraphs, start_from=0, checkpoint_frequency=20):
    """Test generating embeddings for each paragraph individually"""
    print(f"\n=== STEP 2: PARAGRAPH EMBEDDING GENERATION ===")
    print(f"Generating embeddings with {EMBEDDING_MODEL} one paragraph at a time...")
    print(f"Starting from paragraph {start_from+1}")
    
    if not paragraphs:
        print("No paragraphs to process")
        return False
    
    success_count = 0
    failure_count = 0
    embeddings = []
    
    start_time = time.time()
    checkpoint_time = start_time
    
    # Process each paragraph individually
    for i, paragraph in enumerate(paragraphs[start_from:], start=start_from):
        # Calculate and display progress
        percent_complete = (i / len(paragraphs)) * 100
        print(f"\nProcessing paragraph {i+1}/{len(paragraphs)} ({percent_complete:.1f}%)")
        print(f"From chapter: {paragraph['metadata']['chapter_title']}")
        print(f"Text: {paragraph['text'][:100]}...")
        
        # Generate embedding
        embedding, error = generate_embedding(paragraph['text'])
        
        if embedding:
            # Convert to numpy to get dimensions
            embedding_np = np.array(embedding)
            print(f"✅ Successfully generated embedding with shape: {embedding_np.shape}")
            success_count += 1
            embeddings.append({
                'paragraph_index': i,
                'embedding': embedding,
                'metadata': paragraph['metadata']
            })
        else:
            print(f"❌ Failed to generate embedding: {error}")
            failure_count += 1
        
        # Print checkpoint statistics
        if (i + 1) % checkpoint_frequency == 0 or i == len(paragraphs) - 1:
            current_time = time.time()
            checkpoint_elapsed = current_time - checkpoint_time
            total_elapsed = current_time - start_time
            
            # Calculate rates
            paragraphs_per_second = checkpoint_frequency / checkpoint_elapsed if checkpoint_elapsed > 0 else 0
            estimated_total_time = total_elapsed / (i + 1 - start_from) * (len(paragraphs) - start_from)
            estimated_remaining = estimated_total_time - total_elapsed
            
            print(f"\n--- CHECKPOINT STATS ({i+1}/{len(paragraphs)}) ---")
            print(f"Progress: {percent_complete:.1f}% complete")
            print(f"Success rate: {success_count/(success_count+failure_count)*100:.1f}%")
            print(f"Processing rate: {paragraphs_per_second:.2f} paragraphs/second")
            print(f"Elapsed time: {total_elapsed/60:.1f} minutes")
            print(f"Estimated remaining time: {estimated_remaining/60:.1f} minutes")
            print(f"Estimated completion time: {time.ctime(start_time + estimated_total_time)}")
            
            # Reset checkpoint time
            checkpoint_time = current_time
        
        # Add a small delay between requests to avoid rate limiting
        if i < len(paragraphs) - 1:
            time.sleep(0.5)
    
    # Calculate final statistics
    total_time = time.time() - start_time
    paragraphs_per_minute = (success_count + failure_count) / (total_time / 60) if total_time > 0 else 0
    
    print(f"\n=== EMBEDDING GENERATION SUMMARY ===")
    print(f"Total paragraphs processed: {success_count + failure_count}")
    print(f"Successful embeddings: {success_count}")
    print(f"Failed embeddings: {failure_count}")
    print(f"Success rate: {success_count/(success_count+failure_count)*100:.2f}%")
    print(f"Processing rate: {paragraphs_per_minute:.2f} paragraphs/minute")
    print(f"Total time: {total_time/60:.2f} minutes")
    
    return success_count > 0, embeddings

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate embeddings for all paragraphs in an EPUB')
    parser.add_argument('epub_path', help='Path to EPUB file')
    parser.add_argument('--max-paragraphs', type=int, help='Maximum number of paragraphs to process')
    parser.add_argument('--start-from', type=int, default=0, help='Start processing from this paragraph index')
    parser.add_argument('--checkpoint-frequency', type=int, default=20, help='How often to print checkpoint stats')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        # Extract paragraphs from EPUB
        paragraphs, book_title, book_author = extract_paragraphs(args.epub_path, args.max_paragraphs)
        
        if paragraphs:
            # Test embedding generation
            success, embeddings = test_full_book_embeddings(paragraphs, args.start_from, args.checkpoint_frequency) 