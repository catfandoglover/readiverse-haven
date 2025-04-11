import requests
import numpy as np
import uuid
import json
import time
import argparse
import sys
from config import (
    TURBOPUFFER_API_KEY,
    HUGGINGFACE_API_KEY,
    SUPABASE_URL,
    SUPABASE_KEY,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSION
)

def fetch_icons_from_supabase(limit=100):
    """Fetch icons data from Supabase for the discover feed"""
    print(f"Fetching up to {limit} icons from Supabase...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=representation'
    }
    
    # Using regular select query for icons
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/icons",
        headers=headers,
        params={
            'select': 'id,name,illustration,about,slug',
            'order': 'randomizer',
            'limit': limit
        }
    )
    
    if response.status_code != 200:
        raise Exception(f"Error fetching icons: {response.status_code} - {response.text}")
    
    icons = response.json()
    print(f"✅ Successfully fetched {len(icons)} icons")
    return icons

def prepare_icon_text(icon):
    """Format icon data for embedding"""
    # Ensure we have the required fields with fallbacks
    name = icon.get('name', '')
    about = icon.get('about', f"{name} was a significant figure in history.") if name else ''
    slug = icon.get('slug', '') or (name.lower().replace(' ', '-') if name else '')
    
    # Create a structured text representation
    text = f"name: {name}\nabout: {about}\nslug: {slug}"
    return text

def get_embedding(text, max_retries=10, retry_delay=2):
    """Get embedding from Hugging Face API with comprehensive retry logic"""
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}"
    }
    
    api_url = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json={"inputs": text}
            )
            
            # Rate limiting - 503 Service Unavailable
            if response.status_code == 503:
                retry_after = int(response.headers.get('Retry-After', retry_delay))
                print(f"Rate limited (503). Waiting {retry_after}s before retry {attempt+1}/{max_retries}")
                time.sleep(retry_after)
                continue
                
            # Handle other errors
            if response.status_code != 200:
                print(f"Error status {response.status_code}: {response.text}")
                time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                continue
                
            # Parse the response
            embedding = response.json()
            
            # Handle different response formats
            if isinstance(embedding, list) and len(embedding) > 0:
                # If it's a list of lists (standard format)
                if isinstance(embedding[0], list):
                    if len(embedding[0]) != EMBEDDING_DIMENSION:
                        print(f"Warning: Expected {EMBEDDING_DIMENSION} dimensions but got {len(embedding[0])}")
                    return embedding[0]
                # If it's a list of floats (single vector)
                elif isinstance(embedding[0], float):
                    if len(embedding) != EMBEDDING_DIMENSION:
                        print(f"Warning: Expected {EMBEDDING_DIMENSION} dimensions but got {len(embedding)}")
                    return embedding
            # If it's a dictionary with embeddings
            elif isinstance(embedding, dict) and 'embeddings' in embedding:
                embed_array = embedding['embeddings']
                if isinstance(embed_array, list) and len(embed_array) > 0:
                    return embed_array[0] if isinstance(embed_array[0], list) else embed_array
            
            # If we reached here, the format wasn't recognized
            print(f"Unexpected response format: {type(embedding)}")
            print(f"Response sample: {str(embedding)[:100]}...")
            time.sleep(retry_delay)
            continue
                
        except Exception as e:
            print(f"Exception during embedding API call: {str(e)}")
            time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
    
    raise Exception(f"Failed to get embedding after {max_retries} attempts")

def store_icons_embeddings(icons, namespace_name, batch_size=10):
    """Generate and store embeddings for icons in batches"""
    print(f"Storing icon embeddings in namespace: {namespace_name}")
    total_icons = len(icons)
    success_count = 0
    
    # Set headers for Supabase
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'apikey': SUPABASE_KEY
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
    
    # Process icons in batches
    for i in range(0, total_icons, batch_size):
        batch = icons[i:i+batch_size]
        vectors = []
        
        print(f"\nProcessing batch {i//batch_size + 1}/{(total_icons + batch_size - 1)//batch_size} ({len(batch)} icons)...")
        
        for idx, icon in enumerate(batch):
            try:
                icon_id = icon.get('id')
                if not icon_id:
                    print(f"Skipping icon with missing ID")
                    continue
                
                # Prepare the text for embedding
                icon_text = prepare_icon_text(icon)
                print(f"[{i+idx+1}/{total_icons}] Processing: {icon.get('name', 'Unknown')}")
                
                # Get embedding from Hugging Face
                embedding = get_embedding(icon_text)
                
                # Convert embedding to simple list of floats
                # Ensure it's a simple list of numbers, not a complex object or ndarray
                embedding = [float(x) for x in embedding]
                
                # Prepare metadata
                metadata = {
                    'id': icon_id,
                    'name': icon.get('name', ''),
                    'illustration': icon.get('illustration', ''),
                    'about': icon.get('about', ''),
                    'slug': icon.get('slug', ''),
                    'content_type': 'icon',
                    'embedding_source': 'discover_feed'
                }
                
                # Add to vectors batch
                vectors.append({
                    "id": f"icon_{icon_id}",
                    "vector": embedding,
                    "attributes": metadata
                })
                
                success_count += 1
                print(f"✅ Generated embedding for: {icon.get('name', 'Unknown')}")
                
            except Exception as e:
                print(f"❌ Error processing icon {icon.get('name', 'Unknown')}: {str(e)}")
        
        if vectors:
            try:
                # Print a sample of the first vector to help debug
                print(f"Sample vector format: {type(vectors[0]['vector'])}, first 5 elements: {vectors[0]['vector'][:5]}")
                
                # Store the batch of embeddings
                upsert_response = requests.post(
                    f"{SUPABASE_URL}/functions/v1/turbopuffer-api",
                    headers=headers,
                    json={
                        'operation': 'upsert',
                        'namespace': namespace_name,
                        'vectors': vectors,
                        'distance_metric': 'cosine_distance'
                    }
                )
                
                # Check upsert response
                if upsert_response.status_code != 200:
                    print(f"❌ Error upserting vectors: {upsert_response.status_code} - {upsert_response.text}")
                    continue
                
                print(f"✅ Successfully stored batch of {len(vectors)} embeddings")
                
            except Exception as e:
                print(f"❌ Failed to store batch: {str(e)}")
    
    print(f"\nCompleted processing {total_icons} icons")
    print(f"Successfully embedded {success_count}/{total_icons} icons ({success_count/total_icons*100:.2f}%)")
    return success_count

def main():
    parser = argparse.ArgumentParser(description='Generate and store embeddings for icons in the discover feed')
    parser.add_argument('--namespace', default="alexandria_test", help='TurboPuffer namespace to use')
    parser.add_argument('--limit', type=int, default=50, help='Maximum number of icons to process')
    parser.add_argument('--batch-size', type=int, default=10, help='Batch size for processing')
    
    args = parser.parse_args()
    
    try:
        # Fetch icons data
        icons = fetch_icons_from_supabase(limit=args.limit)
        
        # Generate and store embeddings
        success_count = store_icons_embeddings(
            icons, 
            args.namespace, 
            batch_size=args.batch_size
        )
        
        if success_count > 0:
            print(f"\n✅ Successfully created embeddings for {success_count} icons in namespace '{args.namespace}'")
            return 0
        else:
            print(f"\n❌ Failed to create any embeddings. Check the logs for details.")
            return 1
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 