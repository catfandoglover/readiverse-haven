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
from typing import Dict, List, Any

# File paths
INPUT_CSV_PATH = 'dna_assessment_results_rows.csv'
OUTPUT_CSV_PATH = 'dna_analysis_results_output.csv'

# API key
OPENROUTER_API_KEY="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"

# Load the prompt templates from prompts.ts
def load_prompt_templates():
    """Extract prompt templates from the prompts.ts file."""
    try:
        with open('prompts.ts', 'r') as f:
            prompts_content = f.read()
        
        # This is a simplified extraction - in a real app you'd want more robust parsing
        return prompts_content
    except Exception as e:
        print(f"Error loading prompts: {e}")
        return None

def get_prompt_for_section(section: int, answers_json: str, prompts_content: str) -> str:
    """Generate the prompt for a given section."""
    # This is a very simplified version - in a real app you'd parse the TypeScript file properly
    # or extract the templates more robustly
    
    base_prompt = f"""Analyze the following philosophical answers and provide insights in second person ("you"). Format your response as a valid JSON object:

{answers_json}"""
    
    # Different templates for different sections
    if section == 1:
        return base_prompt + """
Template:
{
  "archetype": "Archetype (format: [First Word] [Second Word])",
  "archetype_definition": "Brief poetic subtitle capturing essence",
  "introduction": "Opening paragraph describing philosophical approach",
  "key_tension_1": "First key tension",
  "key_tension_2": "Second key tension",
  "key_tension_3": "Third key tension",
  "natural_strength_1": "First natural strength",
  "natural_strength_2": "Second natural strength",
  "natural_strength_3": "Third natural strength",
  "growth_edges_1": "First growth edge",
  "growth_edges_2": "Second growth edge",
  "growth_edges_3": "Third growth edge",
  "become_who_you_are": "Single-sentence affirmation",
  "theology_introduction": "Theology approach description",
  "ontology_introduction": "Ontology approach description",
  "epistemology_introduction": "Epistemology approach description",
  "ethics_introduction": "Ethics approach description",
  "politics_introduction": "Politics approach description",
  "aesthetics_introduction": "Aesthetics approach description"
}"""
    elif section == 2:
        return base_prompt + """
Template:
{
  "theology_kindred_spirit_1": "First theology kindred thinker",
  "theology_kindred_spirit_1_classic": "Work title (date)",
  "theology_kindred_spirit_1_rationale": "Resonance explanation",
  "theology_kindred_spirit_2": "Second theology kindred thinker",
  "theology_kindred_spirit_2_classic": "Work title (date)",
  "theology_kindred_spirit_2_rationale": "Resonance explanation"
}"""
    elif section == 3:
        return base_prompt + """
Template:
{
  "ontology_kindred_spirit_1": "First ontology kindred thinker",
  "ontology_kindred_spirit_1_classic": "Work title (date)",
  "ontology_kindred_spirit_1_rationale": "Resonance explanation",
  "aesthetics_kindred_spirit_1": "First aesthetics kindred thinker",
  "aesthetics_kindred_spirit_1_classic": "Work title (date)",
  "aesthetics_kindred_spirit_1_rationale": "Resonance explanation",
  "conclusion": "Overall synthesis",
  "next_steps": "Areas for exploration"
}"""
    else:
        raise ValueError(f"Invalid section number: {section}")

def generate_analysis(answers_json: str, section: int, prompts_content: str) -> Dict:
    """Generate analysis for a section using OpenRouter API."""
    prompt = get_prompt_for_section(section, answers_json, prompts_content)
    
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

def generate_complete_analysis(answers_json: str, prompts_content: str) -> Dict:
    """Generate complete analysis with all sections."""
    try:
        # Add delay between requests to avoid rate limiting
        section1 = generate_analysis(answers_json, 1, prompts_content)
        time.sleep(2)
        
        section2 = generate_analysis(answers_json, 2, prompts_content)
        time.sleep(2)
        
        section3 = generate_analysis(answers_json, 3, prompts_content)
        
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
    """Read CSV file and return as list of dictionaries."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        print(f'Error reading CSV file: {e}')
        raise

def write_csv(file_path: str, data: List[Dict]):
    """Write data to CSV file."""
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

def main():
    """Main function to process assessments."""
    try:
        print("Loading prompt templates...")
        prompts_content = load_prompt_templates()
        
        print(f"Reading assessment results from {INPUT_CSV_PATH}...")
        assessment_rows = read_csv(INPUT_CSV_PATH)
        print(f"Found {len(assessment_rows)} assessments")
        
        all_results = []
        
        for row in assessment_rows:
            print(f"Processing assessment for {row['name']} (ID: {row['id']})...")
            
            # Get answers from CSV
            answers_json = row['answers']
            print(f"Answers JSON: {answers_json[:50]}...")
            
            # Generate analysis
            analysis = generate_complete_analysis(answers_json, prompts_content)
            sections = analysis['sections']
            
            # Create combined analysis
            combined_analysis = {
                'assessment_id': row['id'],
                'name': row['name'],
                'analysis_text': json.dumps([s['analysis'] for s in sections]),
                'analysis_type': 'section_1',
            }
            
            # Add other fields from analysis
            valid_column_names = [
                'assessment_id', 'name', 'profile_image_url', 'raw_response', 
                'analysis_text', 'analysis_type', 'archetype', 'introduction',
                'archetype_definition', 'key_tension_1', 'key_tension_2', 'key_tension_3',
                'natural_strength_1', 'natural_strength_2', 'natural_strength_3',
                'growth_edges_1', 'growth_edges_2', 'growth_edges_3',
                'theology_introduction', 'ontology_introduction', 'epistemology_introduction',
                'ethics_introduction', 'politics_introduction', 'aesthetics_introduction'
            ]
            
            for section in sections:
                for key, value in section['analysis'].items():
                    if key in valid_column_names:
                        combined_analysis[key] = value
                    else:
                        print(f'Skipping invalid field: {key}')
            
            all_results.append(combined_analysis)
            print(f"Completed analysis for {row['name']}")
        
        # Write results to CSV
        print(f"Writing results to {OUTPUT_CSV_PATH}...")
        write_csv(OUTPUT_CSV_PATH, all_results)
        
        print("Analysis complete!")
        
    except Exception as e:
        print(f"Error in main process: {e}")

if __name__ == "__main__":
    main()
