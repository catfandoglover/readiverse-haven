# test_orwell_embedding.py
import os
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import requests
import numpy as np
import argparse
from config import HUGGINGFACE_API_KEY, EMBEDDING_MODEL, MIN_PARAGRAPH_LENGTH

def strip_html_tags(html_content):
    """Remove HTML tags from content and clean whitespace"""
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text()
    # Normalize whitespace
    return text.strip()

def extract_paragraph(epub_path):
    """Extract a single paragraph from the EPUB file for testing"""
    try:
        book = epub.read_epub(epub_path)
        
        # Get book metadata
        book_title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "Unknown Title"
        book_author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "Unknown Author"
        
        print(f"Book: {book_title} by {book_author}")
        
        # Get the first document with meaningful content
        items = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
        
        for item in items:
            chapter_content = item.get_content().decode('utf-8', errors='replace')
            soup = BeautifulSoup(chapter_content, 'html.parser')
            p_tags = soup.find_all(['p'])
            
            for p in p_tags:
                text = p.get_text().strip()
                if len(text) >= MIN_PARAGRAPH_LENGTH:
                    print(f"Extracted paragraph: {text[:100]}...")
                    return text
        
        return None
    
    except Exception as e:
        print(f"Error extracting paragraph from {epub_path}: {e}")
        return None

def generate_embedding(text):
    """Generate embedding for the sample paragraph using BGE model"""
    print(f"Generating embedding with {EMBEDDING_MODEL}...")
    
    # Define embedding API endpoint
    API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    try:
        # For bge-large-en-v1.5, add the instruction prefix for better performance
        instruction = "Represent this sentence for searching relevant passages:"
        input_text = f"{instruction} {text}"
        
        print("Sending request to HuggingFace API...")
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json={"inputs": input_text, "task_type": "feature-extraction"}
        )
        
        if response.status_code == 200:
            embedding = response.json()
            
            # Print embedding information
            print(f"Successfully generated embedding!")
            print(f"Embedding dimension: {len(embedding)}")
            
            # Convert to numpy array
            embedding_np = np.array(embedding)
            
            # Normalize embeddings (optional but often useful)
            embedding_np = embedding_np / np.linalg.norm(embedding_np)
            
            return embedding
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test embedding generation with a sample from Orwell\'s 1984')
    parser.add_argument('epub_path', help='Path to EPUB file')
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        # Extract a paragraph from the book
        sample_paragraph = extract_paragraph(args.epub_path)
        
        if sample_paragraph:
            # Generate embedding for the paragraph
            embedding = generate_embedding(sample_paragraph)
            print(f"Embedding generation {'succeeded' if embedding else 'failed'}")
        else:
            print("Failed to extract sample paragraph from the book") 