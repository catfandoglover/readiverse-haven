
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getPromptForSection } from './prompts.ts';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function cleanJsonContent(content: string): string {
  // Remove any markdown formatting
  let cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/`/g, '')
    .trim();
  
  // Extract just the JSON object if there's surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : cleaned;
}

function repairJson(jsonString: string): string {
  try {
    // First attempt: Try to parse as-is
    JSON.parse(jsonString);
    return jsonString;
  } catch (e) {
    console.log("Initial JSON parsing failed, attempting repairs");
    
    // Apply repairs to make the JSON valid
    let result = jsonString
      .replace(/\n/g, ' ')         // Replace newlines with spaces
      .replace(/\r/g, ' ')         // Replace carriage returns
      .replace(/\t/g, ' ')         // Replace tabs
      .replace(/\\'/g, "'")        // Fix escaped single quotes
      .replace(/\\\\/g, '\\')      // Fix double backslashes
      .replace(/,\s*}/g, '}')      // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']')     // Remove trailing commas in arrays
      .replace(/\s+/g, ' ');       // Normalize whitespace
    
    // Handle unescaped quotes inside JSON string values
    // This is a common source of JSON parsing errors
    try {
      JSON.parse(result);
      return result;
    } catch (e) {
      console.log("First repair attempt failed, trying more aggressive repairs");
      
      // More aggressive repairs
      // Extract just the JSON object
      const objectMatch = result.match(/(\{.*\})/s);
      if (objectMatch) {
        result = objectMatch[0];
      }
      
      // Last resort: attempt to fix unescaped quotes
      result = result
        .replace(/([^\\])"/g, '$1\\"')  // Escape unescaped quotes
        .replace(/\\\\\"/g, '\\"');     // Fix double-escaped quotes
      
      return `{"data":${result}}`;  // Wrap in a data object to help parsing
    }
  }
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: Record<string, string>, raw_response: any }> {
  console.log(`Generating analysis for section ${section}`);
  const prompt = getPromptForSection(section, answers_json);

  try {
    console.log(`Sending request to OpenRouter for section ${section}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable.dev'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.7-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Return ONLY a JSON object with no additional formatting. The response must start with { and end with }. All field values must be properly escaped strings with no unescaped quotes or special characters. Follow the template exactly as specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Raw response received for section ${section}`);
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    const rawContent = data.choices[0].message.content;
    console.log(`Processing content for section ${section}: ${rawContent.substring(0, 100)}...`);
    
    // Clean and repair the JSON content
    const cleanedContent = cleanJsonContent(rawContent);
    
    try {
      // First attempt: try to parse directly
      const parsed = JSON.parse(cleanedContent);
      console.log(`Successfully parsed JSON for section ${section}`);
      return {
        content: parsed,
        raw_response: data
      };
    } catch (parseError) {
      console.error(`JSON parsing failed for section ${section}, attempting repairs:`, parseError.message);
      
      // Second attempt: try to repair and parse
      try {
        const repairedJson = repairJson(cleanedContent);
        let parsedResult;
        
        // Check if we wrapped in a data object
        if (repairedJson.startsWith('{"data":')) {
          parsedResult = JSON.parse(repairedJson).data;
        } else {
          parsedResult = JSON.parse(repairedJson);
        }
        
        console.log(`Successfully parsed JSON after repairs for section ${section}`);
        return {
          content: parsedResult,
          raw_response: data
        };
      } catch (repairError) {
        console.error(`JSON repair failed for section ${section}:`, repairError.message);
        
        // Third attempt: extract fields using regex as a last resort
        const fieldPattern = /"([^"]+)":\s*"([^"]*)"/g;
        const fields: Record<string, string> = {};
        let matches;
        
        while ((matches = fieldPattern.exec(cleanedContent)) !== null) {
          fields[matches[1]] = matches[2];
        }
        
        if (Object.keys(fields).length > 0) {
          console.log(`Extracted ${Object.keys(fields).length} fields using regex for section ${section}`);
          return {
            content: fields,
            raw_response: data
          };
        }
        
        throw new Error(`Failed to extract any valid fields from section ${section}`);
      }
    }
  } catch (error) {
    console.error(`Error in section ${section}:`, error);
    throw error;
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ sections: Array<{ analysis: Record<string, string>, raw_response: any }>, error?: string }> {
  try {
    // Process all three sections sequentially to ensure they all complete
    console.log('Starting analysis for all sections...');
    const section1 = await generateAnalysis(answers_json, 1);
    console.log('Successfully completed section 1');
    
    const section2 = await generateAnalysis(answers_json, 2);
    console.log('Successfully completed section 2');
    
    const section3 = await generateAnalysis(answers_json, 3);
    console.log('Successfully completed section 3');
    
    return {
      sections: [
        { analysis: section1.content, raw_response: section1.raw_response },
        { analysis: section2.content, raw_response: section2.raw_response },
        { analysis: section3.content, raw_response: section3.raw_response }
      ]
    };
  } catch (error) {
    console.error('Error in generateCompleteAnalysis:', error);
    return {
      sections: [],
      error: `Failed to generate analysis: ${error.message}`
    };
  }
}

async function checkExistingAnalysis(assessment_id: string): Promise<boolean> {
  try {
    console.log(`Checking if analysis already exists for assessment ${assessment_id}`);
    
    const { data, error, count } = await supabase
      .from('dna_analysis_results')
      .select('id', { count: 'exact' })
      .eq('assessment_id', assessment_id);
      
    if (error) {
      console.error('Error checking for existing analysis:', error);
      return false;
    }
    
    if (count && count > 0) {
      console.log(`Analysis already exists for assessment ${assessment_id}`);
      return true;
    }
    
    console.log(`No existing analysis found for assessment ${assessment_id}`);
    return false;
  } catch (error) {
    console.error('Error in checkExistingAnalysis:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { answers_json, assessment_id, profile_image_url } = await req.json();
      
      if (!answers_json || !assessment_id) {
        throw new Error('Missing required fields: answers_json and assessment_id are required');
      }

      console.log(`Processing assessment ${assessment_id}...`);
      
      // Check if analysis already exists for this assessment
      const analysisExists = await checkExistingAnalysis(assessment_id);
      
      if (analysisExists) {
        console.log(`Analysis already exists for assessment ${assessment_id}, skipping reprocessing`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Analysis already exists for this assessment' 
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          },
        );
      }
      
      // Fetch the name from dna_assessment_results
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('dna_assessment_results')
        .select('name')
        .eq('id', assessment_id)
        .maybeSingle();

      if (assessmentError) {
        console.error('Error fetching assessment data:', assessmentError);
        throw assessmentError;
      }

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      console.log('Generating analysis...');
      // Make sure to await the complete analysis to finish before returning
      const result = await generateCompleteAnalysis(answers_json);
      
      if (result.error) {
        console.error('Analysis generation error:', result.error);
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Combine all sections into a single analysis record
      const combinedAnalysis = {};
      const combinedRawResponses = [];
      const combinedAnalysisTexts = [];

      for (const section of result.sections) {
        Object.assign(combinedAnalysis, section.analysis);
        combinedRawResponses.push(section.raw_response);
        combinedAnalysisTexts.push(section.analysis);
      }
      
      // Store the combined analysis in a single database record
      const analysisRecord = {
        assessment_id,
        name: assessmentData.name,
        profile_image_url,
        raw_response: combinedRawResponses,
        analysis_text: JSON.stringify(combinedAnalysisTexts),
        analysis_type: 'section_1', // Using a valid enum value
        ...combinedAnalysis
      };

      console.log('Storing combined analysis in database...');
      // Ensure we wait for the storage operation to complete
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(analysisRecord);

      if (storeError) {
        console.error('Error storing analysis:', storeError);
        throw storeError;
      }
      
      console.log('Combined analysis stored successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Combined analysis stored successfully'
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
