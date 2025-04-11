import os
import json
import uuid
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import requests
import numpy as np
from tqdm import tqdm
import time
import re
from dotenv import load_dotenv # Import dotenv
import traceback # Import traceback
from requests.exceptions import JSONDecodeError, RequestException # Import specific exceptions
from collections import defaultdict # Import defaultdict

load_dotenv() # Load variables from .env file

# --- Function definitions (epub_to_text, generate_embeddings, store_embeddings_in_turbopuffer) remain the same ---
# ...

def epub_to_text(epub_path):
    """
    Parse EPUB file and extract structured content based on spine order.
    Each spine item is treated as a chapter/section, split by <p>
    or <div class="paragraph"> tags.
    """
    try:
        book = epub.read_epub(epub_path)

        # Extract book metadata (provide defaults)
        book_title = "Unknown Title"
        metadata_title = book.get_metadata('DC', 'title')
        if metadata_title:
            book_title = metadata_title[0][0]

        book_author = "Unknown Author"
        metadata_creator = book.get_metadata('DC', 'creator')
        if metadata_creator:
            book_author = metadata_creator[0][0]

        chapters = []
        spine_items = []

        # --- Get items in spine order ---
        if book.spine:
            for item_id_tuple in book.spine:
                item_id = item_id_tuple[0]
                item = book.get_item_with_id(item_id)
                # We are interested in document items (HTML/XHTML)
                if item is not None and item.get_type() == ebooklib.ITEM_DOCUMENT:
                    spine_items.append(item)
        else:
            print(f"Warning: No spine found in EPUB: {epub_path}. Attempting fallback using all document items.")
            # Fallback: iterate through all document items if spine is missing/empty
            # Note: Order might not be guaranteed without a spine.
            for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
                 spine_items.append(item)

        if not spine_items:
             print(f"Error: No processable document items found in {epub_path}.")
             # Return structure with empty chapters if no content items found
             return {
                 "book_title": book_title,
                 "book_author": book_author,
                 "chapters": []
             }
        # --- End of getting spine items ---


        # --- Process each spine item as a chapter ---
        for idx, item in enumerate(spine_items):
            chapter_number = idx + 1
            chapter_title = f"Section {chapter_number}"

            try:
                content = item.get_content()
                decoded_content = None
                try:
                    decoded_content = content.decode('utf-8')
                except UnicodeDecodeError:
                    # print(f"Warning: UTF-8 decode failed for item {item.id}. Trying 'latin-1'.") # Less verbose
                    try:
                        decoded_content = content.decode('latin-1', errors='ignore')
                    except Exception as decode_err:
                        print(f"Error decoding item {item.id} content: {decode_err}. Skipping item.")
                        continue
                if not decoded_content:
                    print(f"Warning: No content decoded for item {item.id}. Skipping.")
                    continue

                soup = BeautifulSoup(decoded_content, 'html.parser')

                # --- Try to find a better chapter title ---
                found_title = None
                # Prioritize headers within the content
                for tag in ['h1', 'h2', 'h3', 'h4', 'title']: # Check common header tags + <title>
                    header = soup.find(tag)
                    if header and header.text.strip():
                        found_title = header.text.strip()
                        break
                # Fallback to item's manifest ID if no header found
                if found_title:
                    chapter_title = found_title
                elif item.id:
                     chapter_title = f"Section {chapter_number} ({item.id})"

                # --- Extract text using specific tags for paragraph splitting ---
                paragraphs_data = []
                para_counter = 0

                # --- MODIFIED SELECTOR ---
                # Find all <p> tags OR <div class="paragraph"> tags
                # The selector 'p, div.paragraph' finds either standard paragraphs
                # or divs with the specific class 'paragraph'.
                paragraph_tags = soup.select('p, div.paragraph')
                # --- END MODIFIED SELECTOR ---

                if paragraph_tags:
                    for tag in paragraph_tags: # Changed variable name to 'tag'
                        # Extract text from the found tag (<p> or <div>)
                        para_text = tag.get_text(separator=' ', strip=True)

                        # Filter out paragraphs that are too short
                        if len(para_text) > 15:
                            para_counter += 1
                            paragraphs_data.append({
                                "text": para_text,
                                "paragraph_number": para_counter
                            })

                # --- Fallback: If no suitable tags found, try the previous method ---
                elif not paragraphs_data:
                    # This fallback might be less necessary now but kept for robustness
                    # print(f"Warning: No suitable <p> or <div class='paragraph'> tags found/extracted in {chapter_title} (Item ID: {item.id}). Falling back to text split.")
                    full_text = soup.get_text(separator=' ', strip=True)
                    if full_text:
                        lines = [line.strip() for line in full_text.splitlines() if line.strip()]
                        cleaned_full_text = "\n".join(lines)
                        potential_paragraphs = re.split(r'\n{2,}', cleaned_full_text)
                        for para_text in potential_paragraphs:
                             cleaned_text = para_text.strip()
                             if len(cleaned_text) > 15:
                                 para_counter += 1
                                 paragraphs_data.append({
                                     "text": cleaned_text,
                                     "paragraph_number": para_counter
                                 })
                # --- End of paragraph extraction ---


                # Only add the chapter/section if it contains any text paragraphs
                if paragraphs_data:
                    chapters.append({
                        "chapter_number": chapter_number,
                        "chapter_title": chapter_title,
                        "item_id": item.id,
                        "paragraphs": paragraphs_data
                    })

            except Exception as item_err:
                print(f"Error processing spine item {idx+1} (ID: {item.id}) in {epub_path}: {item_err}")
                traceback.print_exc()
                continue
        # --- End of processing spine items ---

        # Return the structured data
        return {
            "book_title": book_title,
            "book_author": book_author,
            "chapters": chapters
        }

    except FileNotFoundError:
        print(f"Error: EPUB file not found at {epub_path}")
        return None
    except ebooklib.epub.EpubException as epub_err:
        print(f"Error reading EPUB file {epub_path} (is it a valid EPUB?): {epub_err}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while parsing {epub_path}: {e}")
        traceback.print_exc()
        return None

def generate_embeddings(texts, api_key, initial_delay=1.0, max_delay=60.0):
    """Generate embeddings for a list of texts using the BGE-M3 model via Hugging Face API with infinite retries."""
    API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-m3"
    headers = {"Authorization": f"Bearer {api_key}"}

    # Ensure texts is a list, even if only one item
    if not isinstance(texts, list):
         texts = [texts]

    if not texts: # Handle empty input list
        print("Warning: generate_embeddings called with empty text list.")
        return []

    batch_size = 10 # Keep batching
    all_embeddings = []
    print(f"Generating embeddings for {len(texts)} texts in batches of {batch_size}...")

    for i in tqdm(range(0, len(texts), batch_size), desc="Embedding Batches"):
        batch_texts = texts[i:i+batch_size]
        current_batch_embeddings = [None] * len(batch_texts)
        delay = initial_delay

        # --- Loop indefinitely until success or non-retriable error ---
        while True:
            batch_processed = False # Flag to check if batch succeeded
            try:
                payload = {"inputs": batch_texts}
                response = requests.post(API_URL, headers=headers, json=payload, timeout=90) # Increased timeout slightly

                if response.status_code == 200:
                    try:
                        result = response.json()
                        # --- Adjust Result Checking for Feature Extraction Pipeline ---
                        embeddings_list = None
                        # Feature extraction often returns a list of lists directly
                        if isinstance(result, list):
                            if all(isinstance(emb, list) for emb in result):
                                 # Sometimes it's nested one level deeper per sentence
                                 # Check if the first element is a list containing the actual vector
                                 if len(result) > 0 and isinstance(result[0], list) and len(result[0]) == 1 and isinstance(result[0][0], list):
                                     # Extract the actual embedding vector from the nested list
                                     embeddings_list = [item[0] for item in result]
                                 else:
                                    # Assume it's already the list of embeddings
                                    embeddings_list = result
                            # Handle cases where it might return dicts with 'embedding' key (less common for pipeline)
                            elif all(isinstance(emb, dict) and 'embedding' in emb for emb in result):
                                 embeddings_list = [item['embedding'] for item in result]

                        # Fallback check if result is a dict (less likely for pipeline)
                        elif isinstance(result, dict) and 'embeddings' in result:
                             if isinstance(result['embeddings'], list) and all(isinstance(emb, list) for emb in result['embeddings']):
                                  embeddings_list = result['embeddings']

                        # Validate the received embeddings list
                        if embeddings_list is not None:
                            if len(embeddings_list) == len(batch_texts):
                                current_batch_embeddings = embeddings_list
                                batch_processed = True # Mark as successful
                                break # Exit retry loop on success
                            else:
                                # Log mismatch, will retry
                                print(f"  Warning: Batch {i//batch_size + 1}: Mismatch between input ({len(batch_texts)}) and output ({len(embeddings_list)}) lengths. Retrying...")
                        else:
                             # Log unexpected format, will retry
                            print(f"  Error: Batch {i//batch_size + 1}: Unexpected API response format: {str(result)[:200]}... Retrying...")

                    except JSONDecodeError:
                         # Log JSON error, will retry
                        print(f"  Error: Batch {i//batch_size + 1}: Failed to decode JSON response. Body: {response.text[:200]}... Retrying...")
                    except Exception as json_err:
                         # Log processing error, will retry (could reconsider this, maybe break?)
                         print(f"  Error: Batch {i//batch_size + 1}: Error processing JSON response: {json_err}. Retrying...")

                # --- Handle Retriable Errors (like 503) ---
                elif response.status_code in [500, 502, 503, 504]:
                    print(f"  Warning: Batch {i//batch_size + 1}: API Error {response.status_code}. Retrying in {delay:.1f}s...")
                # --- Handle Non-Retriable Client Errors (like 400, 401, 422) ---
                elif 400 <= response.status_code < 500:
                     print(f"  Error: Batch {i//batch_size + 1}: Client Error {response.status_code}: {response.text[:200]}... Not retrying. Skipping batch.")
                     # Assign Nones for this batch and break the inner loop
                     current_batch_embeddings = [None] * len(batch_texts)
                     batch_processed = True # Mark as "processed" (by skipping) to exit loop
                     break
                # --- Handle Other Unexpected Status Codes (Treat as Retriable for now) ---
                else:
                    print(f"  Error: Batch {i//batch_size + 1}: Unexpected API Status {response.status_code}: {response.text[:200]}... Retrying in {delay:.1f}s...")


            except RequestException as req_err:
                # Network errors are retriable
                print(f"  Error: Batch {i//batch_size + 1}: Request failed: {req_err}. Retrying in {delay:.1f}s...")
            except Exception as e:
                # Unexpected errors in our code - break loop and skip batch
                print(f"  Error: Batch {i//batch_size + 1}: Exception during embedding generation: {e}")
                traceback.print_exc()
                current_batch_embeddings = [None] * len(batch_texts) # Assign Nones
                batch_processed = True # Mark as "processed" (by skipping) to exit loop
                break

            # --- If not successful, wait and increase delay for next retry ---
            if not batch_processed:
                print(f"    (Waiting {delay:.1f}s before next attempt for batch {i//batch_size + 1})")
                time.sleep(delay)
                delay = min(delay * 2, max_delay) # Exponential backoff up to max_delay

        # Extend the main list with the results for this batch
        all_embeddings.extend(current_batch_embeddings)
        # Keep small delay between batches
        time.sleep(0.2)

    # Final check: Ensure the final list has the same length as the input texts
    if len(all_embeddings) != len(texts):
         print(f"Critical Error: Final embeddings count ({len(all_embeddings)}) does not match input text count ({len(texts)}). Returning list of Nones.")
         # Return list of Nones as a failsafe, matching input length
         return [None] * len(texts)

    successful_count = len([e for e in all_embeddings if e is not None])
    print(f"Finished generating embeddings. Got {successful_count} successful embeddings out of {len(texts)}.")
    return all_embeddings # Should always return a list

def store_embeddings_in_turbopuffer(embeddings_data, api_key, namespace):
    """Store embeddings and metadata in Turbopuffer."""
    if not embeddings_data:
        print("Warning: No embeddings data provided to store_embeddings_in_turbopuffer.")
        return None

    API_URL = f"https://api.turbopuffer.com/v1/vectors/{namespace}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # --- Transform attributes to the required format (Map of Lists) ---
    transformed_attributes = defaultdict(list)
    all_attribute_keys = set() # Keep track of all keys encountered

    # First pass to find all possible attribute keys across all items
    for item in embeddings_data:
        if 'attributes' in item and isinstance(item['attributes'], dict):
            all_attribute_keys.update(item['attributes'].keys())

    # Second pass to build the lists, ensuring all lists have the same length
    for item in embeddings_data:
        attributes_dict = item.get('attributes', {}) if isinstance(item.get('attributes'), dict) else {}
        for key in all_attribute_keys:
            # Append the value if key exists, otherwise append None (or a default)
            transformed_attributes[key].append(attributes_dict.get(key)) # Use .get() for safety

    # --- End Attribute Transformation ---


    # Prepare data in the format Turbopuffer expects
    payload = {
        "ids": [item['id'] for item in embeddings_data],
        "vectors": [item['vector'] for item in embeddings_data],
        # --- Re-enable attributes with the transformed data ---
        "attributes": transformed_attributes
        # --- End Re-enable ---
    }

    attributes_count = len(payload.get("attributes", {}).get(list(all_attribute_keys)[0], [])) if all_attribute_keys else 0
    print(f"Sending {len(payload['ids'])} vectors with {attributes_count} attribute values per key to Turbopuffer namespace: {namespace}")


    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)

        # (Debugging prints can be kept for now or removed)
        print(f"  Turbopuffer Response Status Code: {response.status_code}")
        print(f"  Turbopuffer Response Text: {response.text[:500]}")

        response.raise_for_status()

        # (JSON decoding remains the same)
        try:
            result_json = response.json()
            return result_json
        except JSONDecodeError:
            print(f"  Error: Failed to decode JSON response from Turbopuffer, though status code was {response.status_code}.")
            return None

    except requests.exceptions.RequestException as e:
        # (Error handling remains the same)
        print(f"Error storing embeddings in Turbopuffer: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"  Error Response Body: {e.response.text[:500]}")
        return None
    except Exception as e:
        # (Error handling remains the same)
        print(f"An unexpected error occurred during Turbopuffer storage: {e}")
        traceback.print_exc()
        return None

def embed_book_to_turbopuffer(epub_path, book_uuid, hf_api_key, turbopuffer_api_key, turbopuffer_namespace="alexandria-embeddings"):
    """
    Process an EPUB book, generate embeddings, and store in Turbopuffer.
    Includes paragraph text in attributes.
    """
    # Parse the EPUB file
    print(f"Parsing EPUB: {epub_path}")
    book_content = epub_to_text(epub_path)

    # Prepare data for embedding
    texts_to_embed = []
    metadata = []

    if not book_content or "chapters" not in book_content or not book_content["chapters"]: # Added check for None book_content
        print(f"Warning: No chapters found or extracted for {epub_path}. Skipping embedding.")
        return {"status": "skipped", "reason": "No chapters found"}

    for chapter in book_content["chapters"]:
        # Ensure paragraphs exist and is a list
        if "paragraphs" not in chapter or not isinstance(chapter["paragraphs"], list):
            continue # Skip chapter if no paragraphs list

        for paragraph in chapter["paragraphs"]:
            # Ensure paragraph is a dict and has text
            if not isinstance(paragraph, dict) or "text" not in paragraph:
                continue # Skip invalid paragraph structure

            para_text = paragraph["text"]
            texts_to_embed.append(para_text)

            # Metadata for this text
            metadata.append({
                "book_title": book_content.get("book_title", "Unknown Title"), # Use .get for safety
                "book_author": book_content.get("book_author", "Unknown Author"),
                "book_uuid": str(book_uuid),
                "chapter_number": chapter.get("chapter_number", -1),
                "chapter_title": chapter.get("chapter_title", "Unknown Chapter"),
                "paragraph_number": paragraph.get("paragraph_number", -1),
                # --- ADD PARAGRAPH TEXT TO METADATA ---
                "paragraph_text": para_text
                # --- END ADDITION ---
            })

    if not texts_to_embed:
        print(f"Warning: No text paragraphs found to embed for {epub_path}. Skipping embedding.")
        return {"status": "skipped", "reason": "No text found"}

    print(f"Generating embeddings for {len(texts_to_embed)} paragraphs...")
    # Pass API key to generate_embeddings
    embeddings = generate_embeddings(texts_to_embed, hf_api_key) # Ensure hf_api_key is passed

    # Prepare data for Turbopuffer
    embeddings_data = []
    failed_embeddings = 0

    # Check if embeddings list matches metadata length
    if len(embeddings) != len(metadata):
         print(f"Critical Error: Mismatch between embeddings count ({len(embeddings)}) and metadata count ({len(metadata)}). Aborting storage.")
         # Decide how to handle this - maybe return an error status
         return {"status": "error", "reason": "Embeddings/metadata count mismatch"}


    for i, embedding in enumerate(embeddings):
        if embedding is not None and isinstance(embedding, list):
            # Generate a unique ID for each paragraph embedding
            # Format: book_uuid:chapter_num:paragraph_num
            para_meta = metadata[i] # Get corresponding metadata
            unique_id = f"{para_meta['book_uuid']}:{para_meta['chapter_number']}:{para_meta['paragraph_number']}"

            embeddings_data.append({
                "id": unique_id,
                "vector": embedding,
                "attributes": para_meta # The entire metadata dict (now including text)
            })
        else:
            failed_embeddings += 1
            # print(f"Warning: Skipping paragraph due to missing or invalid embedding (Index: {i})") # Optional: more verbose logging

    if failed_embeddings > 0:
         print(f"Warning: Skipped {failed_embeddings} paragraphs due to embedding errors.")

    if not embeddings_data:
        print("Error: No valid embeddings generated or prepared for storage.")
        return {"status": "error", "reason": "No valid embeddings to store"}

    # Store in Turbopuffer
    print(f"Storing {len(embeddings_data)} embeddings in Turbopuffer (skipped {failed_embeddings} due to errors)...")
    # Pass API key and namespace to storage function
    result = store_embeddings_in_turbopuffer(embeddings_data, turbopuffer_api_key, turbopuffer_namespace)

    print("Embedding process finished.")
    print(f"Turbopuffer API Result: {result}")
    return result # Return the result from the storage function

# Example usage for your specific book
if __name__ == "__main__":
    # Get API keys from environment variables
    hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
    turbopuffer_api_key = os.getenv("TURBOPUFFER_API_KEY")
    # --- Use the new namespace ---
    turbopuffer_namespace = "1984-test-embedding"
    # --- End namespace change ---

    if not hf_api_key or not turbopuffer_api_key:
        print("Error: API keys not found. Set HUGGINGFACE_API_KEY and TURBOPUFFER_API_KEY in your .env file.")
        exit(1)

    # Get the path to your Downloads folder
    home_directory = os.path.expanduser("~")
    downloads_folder = os.path.join(home_directory, "Downloads")
    # Consider making the EPUB path an argument or configurable
    epub_path = os.path.join(downloads_folder, "1984-George Orwell (3).epub")

    if not os.path.exists(epub_path):
        print(f"Error: EPUB file not found at {epub_path}")
        exit(1)

    # Use the provided book UUID
    book_uuid = "260e254a-092e-4a7c-90d8-f763f0398e52" # Consider making this configurable

    # Process the book
    result = embed_book_to_turbopuffer(
        epub_path,
        book_uuid,
        hf_api_key,
        turbopuffer_api_key,
        turbopuffer_namespace # Pass the NEW namespace
    )
    print(f"\nEmbedding process finished.")
    print(f"Turbopuffer API Result: {result}")

    # Add a line to print the paragraph text
    if result.get("status") == "success":
        for embedding in result.get("embeddings", []):
            print(f"Paragraph Text: {embedding.get('paragraph_text', 'N/A')}") 
