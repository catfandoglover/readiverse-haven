# test_epub_parsing.py
import os
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import re
import argparse
from config import MIN_PARAGRAPH_LENGTH

def strip_html_tags(html_content):
    """Remove HTML tags from content and clean whitespace"""
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text()
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_paragraphs(html_content):
    """Extract paragraphs from HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    paragraphs = []
    
    # Find all paragraph elements
    p_tags = soup.find_all(['p'])
    
    for p in p_tags:
        text = p.get_text().strip()
        # Only include paragraphs with meaningful content
        if len(text) >= MIN_PARAGRAPH_LENGTH:
            paragraphs.append(text)
    
    return paragraphs

def parse_epub(epub_path):
    """Parse EPUB file and extract paragraphs with chapter information"""
    try:
        book = epub.read_epub(epub_path)
        
        # Get book metadata
        book_title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "Unknown Title"
        book_author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "Unknown Author"
        
        print(f"Book: {book_title} by {book_author}")
        
        # Extract book structure
        chapters = []
        items = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
        
        # Sort items by spine order if available
        if book.spine:
            spine_ids = [item[0] for item in book.spine]
            items.sort(key=lambda x: spine_ids.index(x.get_id()) if x.get_id() in spine_ids else float('inf'))
        
        # Process each document (chapter)
        total_paragraphs = 0
        
        for i, item in enumerate(items):
            chapter_content = item.get_content().decode('utf-8', errors='replace')
            chapter_title = f"Chapter {i+1}"  # Default chapter title
            
            # Try to extract chapter title from content
            soup = BeautifulSoup(chapter_content, 'html.parser')
            heading = soup.find(['h1', 'h2', 'h3', 'h4'])
            if heading:
                chapter_title = heading.get_text().strip()
            
            # Extract paragraphs
            paragraphs = extract_paragraphs(chapter_content)
            
            # Only include chapters with meaningful content
            if paragraphs:
                chapters.append({
                    'chapter_number': i+1,
                    'chapter_title': chapter_title,
                    'paragraphs': paragraphs
                })
                total_paragraphs += len(paragraphs)
                
                print(f"  Chapter {i+1}: '{chapter_title}' - {len(paragraphs)} paragraphs")
        
        print(f"Total: {len(chapters)} chapters, {total_paragraphs} paragraphs")
        
        # Print sample paragraphs
        print("\nSample paragraphs:")
        for i, chapter in enumerate(chapters[:2]):  # First two chapters
            print(f"\nFrom '{chapter['chapter_title']}':")
            for j, paragraph in enumerate(chapter['paragraphs'][:2]):  # First two paragraphs
                print(f"  Paragraph {j+1}: {paragraph[:100]}...")
        
        return {
            'book_title': book_title,
            'book_author': book_author,
            'chapters': chapters
        }
    
    except Exception as e:
        print(f"Error parsing {epub_path}: {e}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test EPUB parsing')
    parser.add_argument('epub_path', help='Path to EPUB file')
    args = parser.parse_args()
    
    if not os.path.exists(args.epub_path):
        print(f"Error: File not found - {args.epub_path}")
    else:
        book_data = parse_epub(args.epub_path)
        print("EPUB parsing complete") 