# test_paragraph_embeddings.py
import os
import time
import argparse
import requests
import numpy as np
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub
from config import HUGGINGFACE_API_KEY, EMBEDDING_MODEL, MIN_PARAGRAPH_LENGTH

def extract_paragraphs(epub_path, max_paragraphs=10):
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
        
        # Print sample paragraphs
        for i, p in enumerate(all_paragraphs):
            if i < 2:  # Print first 2 paragraphs as samples
                print(f"\nSample paragraph {i+1} from '{p['metadata']['chapter_title']}':")
                print(f"  {p['text'][:150]}...")
        
        return all_paragraphs, book_title, book_author
    
    except Exception as e:
        print(f"Error parsing EPUB: {e}")
        return None, None, None

def generate_embedding(paragraph_text):
    """Generate embedding for a single paragraph"""
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
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
            }
        )
        
        if response.status_code == 200:
            embedding = response.json()
            return embedding
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def test_paragraph_embeddings(paragraphs):
    """Test generating embeddings for each paragraph individually"""
    print(f"\n=== STEP 2: PARAGRAPH EMBEDDING GENERATION ===")
    print(f"Generating embeddings with {EMBEDDING_MODEL} one paragraph at a time...")
    
    if not paragraphs:
        print("No paragraphs to process")
        return False
    
    success_count = 0
    failure_count = 0
    
    for i, paragraph in enumerate(paragraphs):
        print(f"\nProcessing paragraph {i+1}/{len(paragraphs)}")
        print(f"Text: {paragraph['text'][:100]}...")
        
        embedding = generate_embedding(paragraph['text'])
        
        if embedding:
            # Convert to numpy to get dimensions
            embedding_np = np.array(embedding)
            print(f"✅ Successfully generated embedding with shape: {embedding_np.shape}")
            success_count += 1
        else:
            print(f"❌ Failed to generate embedding")
            failure_count += 1
        
        # Add a delay between requests to avoid rate limiting
        if i < len(paragraphs) - 1:
            time.sleep(1)
    
    print(f"\n=== EMBEDDING GENERATION SUMMARY ===")
    print(f"Total paragraphs processed: {len(paragraphs)}")
    print(f"Successful embeddings: {success_count}")
    print(f"Failed embeddings: {failure_count}")
    print(f"Success rate: {success_count/len(paragraphs)*100:.2f}%")
    
    return success_count > 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test paragraph-level embedding generation')
    parser.add_argument('epub_path', help='Path to EPUB file')
    parser.add_argument('--max-paragraphs', type=int, default=5, help='Maximum number of paragraphs to process')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        # Extract paragraphs from EPUB
        paragraphs, book_title, book_author = extract_paragraphs(args.epub_path, args.max_paragraphs)
        
        if paragraphs:
            # Test embedding generation
            test_paragraph_embeddings(paragraphs) 