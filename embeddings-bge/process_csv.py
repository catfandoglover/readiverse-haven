#!/usr/bin/env python
import os
import csv
import uuid
import time
import requests
import tempfile
import multiprocessing
from concurrent.futures import ProcessPoolExecutor, as_completed
from embed_books import embed_book_to_turbopuffer
from dotenv import load_dotenv
from tqdm import tqdm
import argparse

# Load environment variables from .env file
load_dotenv()

# Default CSV file path
DEFAULT_CSV_PATH = os.path.expanduser("~/Downloads/Embeddings Prep_ Epubs.csv")
# Default namespace prefix
DEFAULT_NAMESPACE_PREFIX = "alexandria-"

def download_book(url, temp_dir):
    """
    Download an EPUB file from a URL to a temporary location.
    Returns the path to the downloaded file.
    """
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()  # Raise exception for any HTTP error
        
        # Extract filename from URL or create a random one if not possible
        if url.endswith('.epub'):
            filename = url.split('/')[-1]
        else:
            filename = f"{uuid.uuid4()}.epub"
        
        # Create a path in the temp directory
        file_path = os.path.join(temp_dir, filename)
        
        # Write the content to the file
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        return file_path
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def process_book(row, hf_api_key, turbopuffer_api_key, namespace_prefix):
    """
    Process a single book from a CSV row.
    Downloads the book, embeds it, and returns the results.
    """
    download_url = row['download_url']
    book_uuid = row.get('books_table_uuid', None)
    
    # Generate a random UUID if none is provided
    if not book_uuid or book_uuid.strip() == '':
        book_uuid = str(uuid.uuid4())
        
    # Create a temporary directory for this book
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Download the book
            print(f"Downloading book from {download_url}")
            epub_path = download_book(download_url, temp_dir)
            
            if not epub_path:
                return {
                    'download_url': download_url, 
                    'book_uuid': book_uuid,
                    'status': 'error',
                    'reason': 'Failed to download the file'
                }
            
            # Create a namespace using UUID to ensure uniqueness
            book_slug = download_url.split('/')[-1].replace('.epub', '').replace('%20', '-')
            namespace = f"{namespace_prefix}{book_slug}-{book_uuid[:8]}"
            
            # Process the book
            print(f"Processing book: {book_uuid}, namespace: {namespace}")
            start_time = time.time()
            result = embed_book_to_turbopuffer(
                epub_path,
                book_uuid,
                hf_api_key,
                turbopuffer_api_key,
                namespace
            )
            
            # Add duration and metadata to result
            processing_time = time.time() - start_time
            result['download_url'] = download_url
            result['book_uuid'] = book_uuid
            result['namespace'] = namespace
            result['processing_time'] = processing_time
            
            return result
            
        except Exception as e:
            # Return error information if something goes wrong
            print(f"Error processing {download_url}: {e}")
            return {
                'download_url': download_url, 
                'book_uuid': book_uuid,
                'status': 'error',
                'reason': str(e)
            }

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Process multiple books from a CSV file in parallel.')
    parser.add_argument('--csv', default=DEFAULT_CSV_PATH, help='Path to the CSV file')
    parser.add_argument('--workers', type=int, default=3, help='Number of parallel workers')
    parser.add_argument('--namespace-prefix', default=DEFAULT_NAMESPACE_PREFIX, help='Prefix for Turbopuffer namespaces')
    parser.add_argument('--skip', type=int, default=0, help='Number of rows to skip (excluding header)')
    parser.add_argument('--limit', type=int, default=None, help='Maximum number of books to process')
    
    args = parser.parse_args()
    
    # Get API keys
    hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
    turbopuffer_api_key = os.getenv("TURBOPUFFER_API_KEY")
    
    if not hf_api_key or not turbopuffer_api_key:
        print("Error: API keys not found. Set HUGGINGFACE_API_KEY and TURBOPUFFER_API_KEY in your .env file.")
        exit(1)
    
    # Read CSV file
    print(f"Reading CSV file: {args.csv}")
    try:
        with open(args.csv, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        exit(1)
    
    # Apply skip and limit
    start_idx = args.skip
    end_idx = len(rows) if args.limit is None else min(start_idx + args.limit, len(rows))
    rows_to_process = rows[start_idx:end_idx]
    
    print(f"Found {len(rows)} rows in CSV. Processing rows {start_idx+1} to {end_idx}.")
    
    # Set maximum number of workers based on CPU cores, but don't exceed requested count
    max_workers = min(args.workers, multiprocessing.cpu_count())
    print(f"Using {max_workers} parallel workers")
    
    results = []
    successful = 0
    failed = 0
    
    # Process books in parallel
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        futures = {
            executor.submit(
                process_book, 
                row, 
                hf_api_key, 
                turbopuffer_api_key, 
                args.namespace_prefix
            ): row for row in rows_to_process
        }
        
        # Process completed tasks with a progress bar
        with tqdm(total=len(rows_to_process), desc="Processing Books") as pbar:
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                
                # Update counts
                if result.get('status') == 'success':
                    successful += 1
                else:
                    failed += 1
                
                # Update progress bar
                pbar.update(1)
                pbar.set_postfix(successful=successful, failed=failed)
    
    # Print summary
    print("\n--- PROCESSING SUMMARY ---")
    print(f"Total books processed: {len(results)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    # Write results to file
    results_file = f"embedding_results_{time.strftime('%Y%m%d_%H%M%S')}.csv"
    print(f"Writing detailed results to {results_file}")
    
    with open(results_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'download_url', 'book_uuid', 'namespace', 'status', 
            'processing_time', 'paragraphs_count', 'reason'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for result in results:
            # Prepare a clean row with only the fields we want
            row = {
                'download_url': result.get('download_url', ''),
                'book_uuid': result.get('book_uuid', ''),
                'namespace': result.get('namespace', ''),
                'status': result.get('status', 'unknown'),
                'processing_time': round(result.get('processing_time', 0), 2),
                'paragraphs_count': len(result.get('embeddings', [])) if 'embeddings' in result else 0,
                'reason': result.get('reason', '')
            }
            writer.writerow(row)
    
    print("Done!")

if __name__ == "__main__":
    main() 