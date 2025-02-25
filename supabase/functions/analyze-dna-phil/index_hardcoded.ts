import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getPromptForSection } from './prompts.ts';
import { parse as csvParse } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { stringify as csvStringify } from "https://deno.land/std@0.170.0/encoding/csv.ts";

// Replace with your OpenRouter API key or use environment variable
const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || 'your-api-key-here';

// Path to read CSV input and write CSV output
const INPUT_CSV_PATH = './dna_assessment_results_rows.csv';
const OUTPUT_CSV_PATH = './dna_analysis_results_output.csv';

// Read DNA assessment results from CSV
async function readDnaAssessmentResults(): Promise<any[]> {
  try {
    const csvText = await Deno.readTextFile(INPUT_CSV_PATH);
    const rows = await csvParse(csvText, {
      skipFirstRow: true,
      columns: true,
    });
    console.log('Successfully read CSV file:', rows);
    return rows;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: Record<string, string>, raw_response: any }> {
  const prompt = getPromptForSection(section, answers_json);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable.dev'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always return your response as a valid JSON object with the exact field names specified in the template.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    console.log('Raw AI response for section', section, ':', data.choices[0].message.content);
    
    // Parse the JSON response
    let parsedContent: Record<string, string>;
    try {
      parsedContent = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.error('Raw content:', data.choices[0].message.content);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      content: parsedContent,
      raw_response: data
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ sections: Array<{ analysis: Record<string, string>, raw_response: any }> }> {
  try {
    const section1 = await generateAnalysis(answers_json, 1);
    const section2 = await generateAnalysis(answers_json, 2);
    const section3 = await generateAnalysis(answers_json, 3);
    
    return {
      sections: [
        { analysis: section1.content, raw_response: section1.raw_response },
        { analysis: section2.content, raw_response: section2.raw_response },
        { analysis: section3.content, raw_response: section3.raw_response }
      ]
    };
  } catch (error) {
    console.error('Error in generateCompleteAnalysis:', error);
    throw error;
  }
}

// Main function to process the CSV and generate analysis
async function processAssessments() {
  try {
    // Read assessment results from CSV
    const assessmentRows = await readDnaAssessmentResults();
    
    // Array to hold all analysis results
    const allResults = [];
    
    // Process each assessment row
    for (const row of assessmentRows) {
      console.log(`Processing assessment for ${row.name} (ID: ${row.id})...`);
      
      // Convert the answers from string to object if needed
      let answers_json;
      try {
        // Check if it's already a valid JSON string or needs parsing
        answers_json = row.answers;
      } catch (e) {
        console.error('Error parsing answers JSON:', e);
        continue; // Skip this row if there's an error
      }
      
      // Generate the analysis
      const { sections } = await generateCompleteAnalysis(answers_json);
      
      // Log the sections info
      console.log('Section 0 fields:', Object.keys(sections[0].analysis));
      console.log('Section 1 fields:', Object.keys(sections[1].analysis));
      console.log('Section 2 fields:', Object.keys(sections[2].analysis));
      
      // Valid column names (for filtering)
      const validColumnNames = [
        'assessment_id', 'name', 'profile_image_url', 'raw_response', 
        'analysis_text', 'analysis_type', 'archetype', 'introduction',
        'archetype_definition', 'key_tension_1', 'key_tension_2', 'key_tension_3',
        'natural_strength_1', 'natural_strength_2', 'natural_strength_3',
        'growth_edges_1', 'growth_edges_2', 'growth_edges_3',
        'theology_introduction', 'ontology_introduction', 'epistemology_introduction',
        'ethics_introduction', 'politics_introduction', 'aesthetics_introduction'
        // Add other valid column names from your schema as needed
      ];
      
      // Start with core fields
      const combinedAnalysis = {
        assessment_id: row.id,
        name: row.name,
        profile_image_url: null, // No profile image in CSV
        raw_response: JSON.stringify(sections.map(s => s.raw_response)),
        analysis_text: JSON.stringify(sections.map(s => s.analysis)),
        analysis_type: 'section_1', // Using a valid enum value
      };
      
      // Only add fields that match your schema
      for (const section of sections) {
        for (const [key, value] of Object.entries(section.analysis)) {
          if (validColumnNames.includes(key)) {
            combinedAnalysis[key] = value;
          } else {
            console.log('Skipping invalid field:', key);
          }
        }
      }
      
      // Log the final data being processed
      console.log('Final analysis fields:', Object.keys(combinedAnalysis));
      
      // Add to results array
      allResults.push(combinedAnalysis);
    }
    
    // Convert results to CSV
    const headers = Object.keys(allResults[0] || {});
    const csvContent = await csvStringify(allResults, { 
      columns: headers, 
      header: true 
    });
    
    // Write to CSV file
    await Deno.writeTextFile(OUTPUT_CSV_PATH, csvContent);
    console.log(`Analysis results written to ${OUTPUT_CSV_PATH}`);
    
  } catch (error) {
    console.error('Error in processAssessments:', error);
  }
}

// Run the process
console.log("Starting DNA analysis process with hardcoded values...");
processAssessments();
