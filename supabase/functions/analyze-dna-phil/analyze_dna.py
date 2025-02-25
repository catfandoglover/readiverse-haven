#!/usr/bin/env python3
"""
DNA Analysis Script - Python Version
Reads from CSV, processes with OpenRouter API, and writes results to CSV
"""

import os
import json
import csv
import requests
import time
import re
from typing import Dict, List, Any

# File paths
INPUT_CSV_PATH = 'dna_assessment_results_rows.csv'
OUTPUT_CSV_PATH = 'dna_analysis_results_output.csv'
TS_PROMPTS_PATH = '/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/supabase/functions/analyze-dna-phil/prompts.ts'

# API key
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', "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")

def get_prompt_for_section(section: int, answers_json: str) -> str:
    """
    Extract prompt from TypeScript file for the given section.
    
    Args:
        section: Section number (1-3)
        answers_json: JSON string containing user answers
        
    Returns:
        Extracted prompt string with answers_json inserted
    """
    try:
        if not os.path.exists(TS_PROMPTS_PATH):
            raise FileNotFoundError(f"TypeScript prompts file not found at: {TS_PROMPTS_PATH}")
        
        with open(TS_PROMPTS_PATH, 'r', encoding='utf-8') as f:
            ts_content = f.read()
        
        # Extract the base prompt
        base_prompt_pattern = r'const basePrompt = `(.*?)`;'
        base_prompt_match = re.search(base_prompt_pattern, ts_content, re.DOTALL)
        if not base_prompt_match:
            raise ValueError("Could not find basePrompt in TypeScript file")
        
        base_prompt = base_prompt_match.group(1)
        
        # Extract the template for the specific section
        case_patterns = {
            1: r'case 1:\s*return `\${basePrompt}\s*(.*?)`;',
            2: r'case 2:\s*return `\${basePrompt}\s*(.*?)`;',
            3: r'case 3:\s*return `\${basePrompt}\s*(.*?)`;'
        }
        
        section_pattern = case_patterns.get(section)
        if not section_pattern:
            raise ValueError(f"Invalid section number: {section}")
        
        section_match = re.search(section_pattern, ts_content, re.DOTALL)
        if not section_match:
            raise ValueError(f"Could not find template for section {section} in TypeScript file")
        
        section_template = section_match.group(1)
        
        # Replace ${answers_json} with the actual answers JSON
        complete_prompt = base_prompt.replace("${answers_json}", answers_json) + section_template
        
        return complete_prompt
    except Exception as e:
        print(f"Error extracting prompt from TypeScript: {e}")
        raise

def generate_analysis(answers_json: str, section: int) -> Dict:
    """
    Generate analysis for a section using OpenRouter API.
    
    Args:
        answers_json: JSON string containing user answers
        section: Section number to analyze (1-3)
        
    Returns:
        Dictionary with parsed content and raw response
    """
    prompt = get_prompt_for_section(section, answers_json)
    
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://lovable.dev',
                'X-Title': 'Lovable.dev'
            },
            json={
                'model': 'anthropic/claude-3.5-sonnet',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always return your response as a valid JSON object with the exact field names specified in the template.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            }
        )
        
        response.raise_for_status()
        data = response.json()
        
        if not data.get('choices') or not data['choices'][0].get('message') or not data['choices'][0]['message'].get('content'):
            print('Unexpected API response structure:', data)
            raise ValueError('Invalid API response structure')
        
        content = data['choices'][0]['message']['content']
        print(f'Raw AI response for section {section}:', content[:100] + '...')
        
        try:
            parsed_content = json.loads(content)
            return {
                'content': parsed_content,
                'raw_response': data
            }
        except json.JSONDecodeError as e:
            print('Error parsing JSON response:', e)
            print('Raw content:', content)
            raise ValueError('Invalid JSON response from AI')
            
    except Exception as e:
        print(f'Error generating analysis: {e}')
        raise

def generate_complete_analysis(answers_json: str) -> Dict:
    """
    Generate complete analysis with all three sections.
    
    Args:
        answers_json: JSON string containing user answers
        
    Returns:
        Dictionary with sections containing analysis results
    """
    try:
        # Add delay between requests to avoid rate limiting
        section1 = generate_analysis(answers_json, 1)
        time.sleep(2)
        
        section2 = generate_analysis(answers_json, 2)
        time.sleep(2)
        
        section3 = generate_analysis(answers_json, 3)
        
        return {
            'sections': [
                {'analysis': section1['content'], 'raw_response': section1['raw_response']},
                {'analysis': section2['content'], 'raw_response': section2['raw_response']},
                {'analysis': section3['content'], 'raw_response': section3['raw_response']}
            ]
        }
    except Exception as e:
        print(f'Error in generate_complete_analysis: {e}')
        raise

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
            return list(reader)
    except Exception as e:
        print(f'Error reading CSV file: {e}')
        raise

def write_csv(file_path: str, data: List[Dict]):
    """
    Write data to CSV file.
    
    Args:
        file_path: Path to write CSV file
        data: List of dictionaries to write as CSV rows
    """
    if not data:
        print("No data to write")
        return
    
    try:
        fieldnames = data[0].keys()
        
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
            
        print(f"Successfully wrote {len(data)} rows to {file_path}")
    except Exception as e:
        print(f'Error writing CSV file: {e}')
        raise

def process_assessment(row: Dict) -> Dict:
    """
    Process a single assessment row.
    
    Args:
        row: Dictionary containing assessment data
        
    Returns:
        Dictionary with analysis results
    """
    answers_json = row['answers']
    assessment_id = row['id']
    profile_image_url = row.get('profile_image_url', '')
    name = row['name']
    
    print(f"Processing assessment for {name} (ID: {assessment_id})...")
    print(f"Answers JSON: {answers_json[:50]}...")
    
    # Generate analysis
    analysis_result = generate_complete_analysis(answers_json)
    sections = analysis_result['sections']
    
    # Combine all sections into a single record
    combined_analysis = {
        'assessment_id': assessment_id,
        'name': name,
        'profile_image_url': profile_image_url,
        'raw_response': json.dumps([s['raw_response'] for s in sections]),
        'analysis_text': json.dumps([s['analysis'] for s in sections]),
        'analysis_type': 'section_1',
    }
    
    # Add data from all sections
    for section in sections:
        for key, value in section['analysis'].items():
            combined_analysis[key] = value
    
    return combined_analysis

def main():
    """Main function to process assessments from CSV."""
    try:
        print(f"Reading assessment results from {INPUT_CSV_PATH}...")
        assessment_rows = read_csv(INPUT_CSV_PATH)
        print(f"Found {len(assessment_rows)} assessments")
        
        all_results = []
        
        for row in assessment_rows:
            try:
                result = process_assessment(row)
                all_results.append(result)
                print(f"Completed analysis for {row['name']}")
            except Exception as e:
                print(f"Error processing assessment {row.get('id')}: {e}")
                # Continue with next assessment
        
        # Write results to CSV
        print(f"Writing results to {OUTPUT_CSV_PATH}...")
        write_csv(OUTPUT_CSV_PATH, all_results)
        
        print("Analysis complete!")
        
    except Exception as e:
        print(f"Error in main process: {e}")

if __name__ == "__main__":
    main()
