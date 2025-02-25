# DNA Analysis - Hardcoded Testing Version

This directory contains scripts for analyzing philosophical assessment results with AI.

## Files

- `index.ts` - Original version that uses Supabase databases
- `index_hardcoded.ts` - Modified version that uses CSV files instead of Supabase
- `prompts.ts` - Prompt templates for the AI analysis
- `dna_assessment_results_rows.csv` - Sample data for testing
- `run_local_analysis.sh` - Shell script to run the hardcoded version

## How to Use the Hardcoded Testing Version

The hardcoded version reads from `dna_assessment_results_rows.csv` and outputs to `dna_analysis_results_output.csv` instead of interacting with Supabase.

### Prerequisites

- Deno installed
- OpenRouter API key (for Claude API access)

### Setup

1. Make sure your OpenRouter API key is set:
   - Edit `run_local_analysis.sh` to include your API key
   - OR set it as an environment variable: `export OPENROUTER_API_KEY="your-key-here"`

2. Make sure `dna_assessment_results_rows.csv` contains the test data you want to analyze.

### Running the Analysis

1. Run the script:
   ```bash
   ./run_local_analysis.sh
   ```

2. Check the output in `dna_analysis_results_output.csv`

## Differences from Original Version

1. **Data Source**: 
   - Original: Fetches data from Supabase `dna_assessment_results` table
   - Hardcoded: Reads from local `dna_assessment_results_rows.csv` file

2. **Output**:
   - Original: Stores results in Supabase `dna_analysis_results` table
   - Hardcoded: Saves results to local `dna_analysis_results_output.csv` file

3. **Execution**:
   - Original: Runs as a Supabase Edge Function triggered by HTTP requests
   - Hardcoded: Runs locally via Deno command

## CSV Format

### Input CSV (`dna_assessment_results_rows.csv`)
Contains assessment records with columns like:
- id
- created_at
- name
- answers
- ethics_sequence
- epistemology_sequence
- politics_sequence
- theology_sequence
- ontology_sequence
- aesthetics_sequence

### Output CSV (`dna_analysis_results_output.csv`)
Contains analysis results with columns including:
- assessment_id
- name
- analysis_text
- analysis_type
- archetype
- introduction
- and other analysis fields
