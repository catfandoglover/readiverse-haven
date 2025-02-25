#!/bin/bash

# Set environment variables if needed
export OPENROUTER_API_KEY="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"

# Run the hardcoded analysis script with Deno
echo "Running DNA analysis with hardcoded values..."
deno run --allow-net --allow-read --allow-write --allow-env index_hardcoded.ts

echo "Process complete. Check dna_analysis_results_output.csv for results."
