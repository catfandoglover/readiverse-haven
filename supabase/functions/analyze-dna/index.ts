
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
  let cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/`/g, '')
    .trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : cleaned;
}

function handlePoliticsFields(jsonString: string): string {
  console.log("Applying enhanced politics field handling...");
  
  let processed = jsonString.replace(/\\"/g, "___ESCAPED_QUOTE___");
  
  // Enhanced regex for multiline politics fields, using [\s\S] instead of . to match across lines
  const regex = /"(politics_[^"]+)"\s*:\s*"([\s\S]*?)(?<!\\)"/gs;
  
  processed = processed.replace(regex, (match, fieldName, content) => {
    // Clean content more aggressively for politics fields
    const cleanedContent = content
      .replace(/"/g, '\\"')
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\\\\/g, '\\');
    
    return `"${fieldName}": "${cleanedContent}"`;
  });
  
  return processed.replace(/___ESCAPED_QUOTE___/g, '\\"');
}

function handleProblematicFields(jsonString: string): string {
  console.log("Applying general problematic field handling...");
  
  let processed = handlePoliticsFields(jsonString);
  
  const rationaleRegex = /"([^"]+(?:_rationale|_classic))"\s*:\s*"([\s\S]*?)(?<!\\)"/gs;
  
  processed = processed.replace(rationaleRegex, (match, fieldName, content) => {
    if (fieldName.startsWith('politics_')) {
      return match;
    }
    
    const cleanedContent = content
      .replace(/"/g, '\\"')
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ');
    
    return `"${fieldName}": "${cleanedContent}"`;
  });
  
  return processed;
}

// Updated function to validate and ensure required fields are present
function ensureRequiredFields(jsonObject: Record<string, string>, section: number): Record<string, string> {
  // Changed from section !== 1 to section !== 2
  // This ensures we only apply this special handling to section 1
  if (section !== 1) return jsonObject;
  
  const result = { ...jsonObject };
  
  // Specifically check for the problematic politics fields
  for (let i = 4; i <= 5; i++) {
    // Check for the three related fields for politics_challenging_voice
    const baseField = `politics_challenging_voice_${i}`;
    const classicField = `${baseField}_classic`;
    const rationaleField = `${baseField}_rationale`;
    
    // If any of these fields are missing, add defaults
    if (!result[baseField]) {
      console.log(`Adding missing field: ${baseField}`);
      result[baseField] = `Political Challenger ${i}`;
    }
    
    if (!result[classicField]) {
      console.log(`Adding missing field: ${classicField}`);
      result[classicField] = "Unknown (0000)";
    }
    
    if (!result[rationaleField]) {
      console.log(`Adding missing field: ${rationaleField}`);
      result[rationaleField] = `This challenger represents a political position that contrasts with your views, but the specific details could not be processed correctly.`;
    }
  }
  
  return result;
}

function repairJson(jsonString: string): string {
  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch (e) {
    console.log("Initial JSON parsing failed, attempting repairs:", e.message);
    
    try {
      let result = jsonString
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']')
        .replace(/\s+/g, ' ');
      
      result = handleProblematicFields(result);
      
      JSON.parse(result);
      return result;
    } catch (e) {
      console.log("First repair attempt failed, trying more aggressive repairs:", e.message);
      
      try {
        const keyValuePairs: [string, string][] = [];
        let insideString = false;
        let currentKey = '';
        let currentValue = '';
        let isCollectingKey = true;
        let escapeNext = false;
        
        for (let i = 0; i < jsonString.length; i++) {
          const char = jsonString[i];
          
          if (escapeNext) {
            if (isCollectingKey) {
              currentKey += char;
            } else {
              currentValue += char;
            }
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            if (isCollectingKey) {
              currentKey += char;
            } else {
              currentValue += char;
            }
            continue;
          }
          
          if (char === '"' && !insideString) {
            insideString = true;
            continue;
          }
          
          if (char === '"' && insideString) {
            insideString = false;
            if (isCollectingKey) {
              isCollectingKey = false;
            } else {
              keyValuePairs.push([currentKey, currentValue]);
              currentKey = '';
              currentValue = '';
              isCollectingKey = true;
            }
            continue;
          }
          
          if (insideString) {
            if (isCollectingKey) {
              currentKey += char;
            } else {
              currentValue += char;
            }
          }
          
          if (!insideString && !isCollectingKey && char === ':') {
            continue;
          }
        }
        
        const cleanObj: Record<string, string> = {};
        for (const [key, value] of keyValuePairs) {
          let cleanValue = value
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/"/g, '\\"')
            .replace(/\t/g, ' ')
            .trim();
          
          cleanObj[key] = cleanValue;
        }
        
        if (Object.keys(cleanObj).length > 0) {
          console.log(`Extracted ${Object.keys(cleanObj).length} fields using manual parsing`);
          
          const jsonResult = JSON.stringify(cleanObj);
          
          return handleProblematicFields(jsonResult);
        }
        
        throw new Error("Failed to extract fields using manual parsing");
      } catch (manualError) {
        console.error("Manual parsing failed:", manualError);
        
        try {
          const extractedObject: Record<string, string> = {};
          
          // Enhanced politics pattern matching that's more forgiving
          const politicsPattern = /"(politics_[^"]+)"\s*:\s*"([^"]*)"/g;
          let match;
          
          while ((match = politicsPattern.exec(jsonString)) !== null) {
            const [_, key, value] = match;
            
            const cleanValue = value
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/"/g, '\\"')
              .replace(/\t/g, ' ')
              .trim();
              
            extractedObject[key] = cleanValue;
          }
          
          // Look for missing politics_challenging_voice fields specifically
          for (let i = 1; i <= 5; i++) {
            const baseKey = `politics_challenging_voice_${i}`;
            const classicKey = `${baseKey}_classic`;
            const rationaleKey = `${baseKey}_rationale`;
            
            // If these specific keys are missing, try an even more aggressive pattern
            if (!extractedObject[baseKey]) {
              const specialPattern = new RegExp(`"(${baseKey})"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*,\\s*"|"\\s*})`, "g");
              if ((match = specialPattern.exec(jsonString)) !== null) {
                const [_, key, value] = match;
                extractedObject[key] = value.replace(/\n/g, ' ').replace(/"/g, '\\"').trim();
              }
            }
            
            if (!extractedObject[classicKey]) {
              const specialPattern = new RegExp(`"(${classicKey})"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*,\\s*"|"\\s*})`, "g");
              if ((match = specialPattern.exec(jsonString)) !== null) {
                const [_, key, value] = match;
                extractedObject[key] = value.replace(/\n/g, ' ').replace(/"/g, '\\"').trim();
              }
            }
            
            if (!extractedObject[rationaleKey]) {
              const specialPattern = new RegExp(`"(${rationaleKey})"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*,\\s*"|"\\s*})`, "g");
              if ((match = specialPattern.exec(jsonString)) !== null) {
                const [_, key, value] = match;
                extractedObject[key] = value.replace(/\n/g, ' ').replace(/"/g, '\\"').trim();
              }
            }
          }
          
          const generalPattern = /"([^"]+)"\s*:\s*"([^"]*)"/g;
          
          while ((match = generalPattern.exec(jsonString)) !== null) {
            const [_, key, value] = match;
            
            if (key.startsWith('politics_')) continue;
            
            const cleanValue = value
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/"/g, '\\"')
              .replace(/\t/g, ' ')
              .trim();
              
            extractedObject[key] = cleanValue;
          }
          
          if (Object.keys(extractedObject).length > 0) {
            console.log(`Extracted ${Object.keys(extractedObject).length} fields using regex extraction`);
            return JSON.stringify(extractedObject);
          }
          
          throw new Error("Failed to extract fields from JSON");
        } catch (extractError) {
          console.error("Field extraction failed:", extractError);
          
          return '{"error":"JSON parsing failed","partial_content":"' + 
            jsonString.substring(0, 100).replace(/"/g, '\\"') + '..."}';
        }
      }
    }
  }
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: Record<string, string>, raw_response: any }> {
  console.log(`Generating analysis for section ${section}`);
  const prompt = getPromptForSection(section, answers_json);

  try {
    console.log(`Sending request to OpenRouter for section ${section}`);
    
    let systemPrompt = 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Return ONLY a JSON object with no additional formatting. The response must start with { and end with }. All field values must be properly escaped strings with no unescaped quotes or special characters. Follow the template exactly as specified.';
    
    // Changed from section === 1 to section === 1 
    // This ensures special system prompt is applied to section 1 where politics fields are now located
    if (section === 1) {
      systemPrompt += ' IMPORTANT: For politics_challenging_voice fields and other fields containing philosophical explanations, use single quotes for any quotations within the content, not double quotes. Avoid newlines, tabs, or special characters in your responses. Keep all JSON field values as simple strings without complex formatting. Make sure to include ALL fields in the response, including politics_challenging_voice_4, politics_challenging_voice_5, and their associated _classic and _rationale fields. Ensure every field has a complete value.';
    }
    
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 16000, // Increased from 4000 to 16000 to accommodate all fields
        // Changed from section === 1 to section === 1
        // This ensures lower temperature is applied to section 1 where politics fields are now located
        temperature: section === 1 ? 0.3 : 0.7, // Lower temperature for section 1 to improve consistency
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
    
    const cleanedContent = cleanJsonContent(rawContent);
    
    try {
      const parsed = JSON.parse(cleanedContent);
      console.log(`Successfully parsed JSON for section ${section}`);
      
      // If this is section 1, ensure all required fields are present
      const validatedContent = section === 1 ? ensureRequiredFields(parsed, section) : parsed;
      
      return {
        content: validatedContent,
        raw_response: data
      };
    } catch (parseError) {
      console.error(`JSON parsing failed for section ${section}, attempting repairs:`, parseError.message);
      
      if (section === 1) {
        console.log(`Applying specialized handling for section ${section} which contains challenging fields`);
      }
      
      try {
        const repairedJson = repairJson(cleanedContent);
        let parsedResult;
        
        if (repairedJson.startsWith('{"data":')) {
          parsedResult = JSON.parse(repairedJson).data;
        } else {
          parsedResult = JSON.parse(repairedJson);
        }
        
        console.log(`Successfully parsed JSON after repairs for section ${section}`);
        
        // Ensure all required fields are present, especially for section 1
        const validatedResult = section === 1 ? ensureRequiredFields(parsedResult, section) : parsedResult;
        
        return {
          content: validatedResult,
          raw_response: data
        };
      } catch (repairError) {
        console.error(`JSON repair failed for section ${section}:`, repairError.message);
        
        const fallbackResponse: Record<string, string> = {
          error_message: `Failed to parse section ${section}: ${repairError.message}`,
          partial_content: cleanedContent.substring(0, 500) + "..."
        };
        
        if (section === 1) {
          for (let i = 1; i <= 5; i++) {
            fallbackResponse[`politics_kindred_spirit_${i}`] = `Parsing Error: Thinker ${i}`;
            fallbackResponse[`politics_kindred_spirit_${i}_classic`] = "Error (0000)";
            fallbackResponse[`politics_kindred_spirit_${i}_rationale`] = "Error retrieving data";
            
            fallbackResponse[`politics_challenging_voice_${i}`] = `Parsing Error: Challenger ${i}`;
            fallbackResponse[`politics_challenging_voice_${i}_classic`] = "Error (0000)";
            fallbackResponse[`politics_challenging_voice_${i}_rationale`] = "Error retrieving data";
          }
        }
        
        console.log(`Created fallback response with ${Object.keys(fallbackResponse).length} fields`);
        return {
          content: fallbackResponse,
          raw_response: {
            error: true,
            message: repairError.message,
            original_response: data
          }
        };
      }
    }
  } catch (error) {
    console.error(`Error in section ${section}:`, error);
    throw error;
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ sections: Array<{ analysis: Record<string, string>, raw_response: any }>, error?: string }> {
  try {
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

// New function to validate analysis against database entities
async function validateAnalysisResults(combinedAnalysis: Record<string, string>, analysisId: string): Promise<Record<string, string>> {
  try {
    console.log('Validating analysis results against database entities...');
    const response = await supabase.functions.invoke('validate-dna-entities', {
      body: { analysisResults: combinedAnalysis, analysisId }
    });
    
    if (response.error) {
      console.error('Error validating entities:', response.error);
      return combinedAnalysis; // Return original if validation fails
    }
    
    console.log(`Validation complete. Stats: ${JSON.stringify(response.data.stats)}`);
    if (response.data.unmatchedEntitiesCount > 0) {
      console.log(`Found ${response.data.unmatchedEntitiesCount} unmatched entities that need review`);
    }
    
    return response.data.validatedResults;
  } catch (error) {
    console.error('Error in validateAnalysisResults:', error);
    return combinedAnalysis; // Return original if validation fails
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
      const { answers_json, assessment_id, profile_id } = await req.json();
      
      if (!answers_json || !assessment_id) {
        throw new Error('Missing required fields: answers_json and assessment_id are required');
      }

      console.log(`Processing assessment ${assessment_id}...`);
      
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

      const combinedAnalysis = {};
      const combinedRawResponses = [];
      const combinedAnalysisTexts = [];

      for (const section of result.sections) {
        Object.assign(combinedAnalysis, section.analysis);
        combinedRawResponses.push(section.raw_response);
        combinedAnalysisTexts.push(section.analysis);
      }
      
      // New step: Validate analysis results against database entities
      console.log('Validating analysis results against database entities...');
      const validatedAnalysis = await validateAnalysisResults(combinedAnalysis, assessment_id);
      
      const analysisRecord = {
        assessment_id,
        name: assessmentData.name,
        raw_response: combinedRawResponses,
        analysis_text: JSON.stringify(combinedAnalysisTexts),
        analysis_type: 'section_1',
        ...validatedAnalysis
      };

      // Debug logging to see the full objects before saving
      console.log('===== DEBUG: combinedAnalysis keys =====');
      console.log(Object.keys(validatedAnalysis));
      
      console.log('Storing validated analysis in database...');
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(analysisRecord);

      if (storeError) {
        console.error('Error storing analysis:', storeError);
        throw storeError;
      }
      
      console.log('Analysis stored successfully with validation applied');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Analysis stored successfully with validation applied'
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
