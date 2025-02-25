#!/usr/bin/env python3
"""
CSV to Supabase Import Script
Reads from a CSV file and inserts all records into Supabase table
"""

import os
import csv
import json
from typing import Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Load .env file
ENV_FILE_PATH = '/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/.env'
load_dotenv(ENV_FILE_PATH)

# Configuration
CSV_FILE_PATH = 'dna_analysis_results_output.csv'
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_TABLE = 'dna_analysis_results'


def read_csv(file_path: str) -> List[Dict]:
    """
    Read CSV file and return as list of dictionaries.
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        List of dictionaries representing CSV rows
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            print(f"Read {len(rows)} rows from {file_path}")
            return rows
    except Exception as e:
        print(f'Error reading CSV file: {e}')
        raise

def initialize_supabase() -> Client:
    """
    Initialize Supabase client.
    
    Returns:
        Supabase client
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set")
    
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def preprocess_row(row: Dict) -> Dict:
    """
    Preprocess row data before insertion.
    
    Args:
        row: Dictionary containing row data
        
    Returns:
        Processed row ready for insertion
    """
    processed_row = {}
    
    # Copy all fields from row to processed row
    for key, value in row.items():
        # Skip empty fields
        if value == '':
            continue
            
        # Handle JSON fields that need to be parsed
        if key == 'raw_response' or key == 'analysis_text':
            try:
                processed_row[key] = json.loads(value)
            except json.JSONDecodeError:
                # If not valid JSON, store as string
                processed_row[key] = value
        else:
            processed_row[key] = value
    
    return processed_row

def main():
    """Main function to import CSV data to Supabase."""
    try:
        # Read CSV data
        print(f"Reading data from {CSV_FILE_PATH}...")
        rows = read_csv(CSV_FILE_PATH)
        
        # Initialize Supabase client
        print("Connecting to Supabase...")
        supabase = initialize_supabase()
        
        # Process and insert each row
        print(f"Inserting {len(rows)} rows into {SUPABASE_TABLE}...")
        
        for i, row in enumerate(rows):
            try:
                # Preprocess row
                processed_row = preprocess_row(row)
                
                # Insert row
                result = supabase.table(SUPABASE_TABLE).insert(processed_row).execute()
                
                # Check for errors
                if result.data:
                    print(f"Inserted row {i+1}/{len(rows)}: {processed_row.get('assessment_id', 'unknown')}")
                else:
                    print(f"Error inserting row {i+1}: {result.error}")
                    
            except Exception as e:
                print(f"Error processing row {i+1}: {e}")
                # Continue with next row
        
        print("Import complete!")
        
    except Exception as e:
        print(f"Error in main process: {e}")

if __name__ == "__main__":
    main()
