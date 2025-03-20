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

function preprocessJsonString(jsonString: string): string {
  let processed = jsonString.replace(/\r?\n/g, ' ');
  processed = processed.replace(/\s+/g, ' ');
  return processed;
}

function standardizeJsonFormat(jsonString: string): string {
  let processed = preprocessJsonString(jsonString);
  
  const politicsFieldRegex = /"(politics_[^"]+)"\s*:\s*"([^"]*)"/g;
  processed = processed.replace(politicsFieldRegex, (match, fieldName, content) => {
    const cleanedContent = content
      .replace(/"/g, "'")
      .replace(/\\/g, '\\\\')
      .trim();
      
    return `"${fieldName}": "${cleanedContent}"`;
  });
  
  const otherFieldsRegex = /"([^"]+)"\s*:\s*"([^"]*)"/g;
  processed = processed.replace(otherFieldsRegex, (match, fieldName, content) => {
    if (fieldName.startsWith('politics_')) {
      return match;
    }
    
    const cleanedContent = content
      .replace(/"/g, "'")
      .replace(/\\/g, '\\\\')
      .trim();
      
    return `"${fieldName}": "${cleanedContent}"`;
  });
  
  return processed;
}

async function generateSection2Analysis(answers_json: string): Promise<{ content: Record<string, string>, raw_response: any }> {
  console.log('Generating section 2 analysis using split approach');
  
  const domains = ['theology', 'epistemology', 'ethics', 'politics'];
  const subsectionResults: Record<string, any> = {};
  const rawResponses: any[] = [];
  
  try {
    for (const domain of domains) {
      console.log(`Processing "${domain}" subsection`);
      
      const systemPrompt = `You are analyzing the user's ${domain} profile. Return ONLY a valid JSON object with fields related to ${domain}. 
      Follow these formatting rules:
      1. Return ONLY a valid JSON object without markdown formatting
      2. Use SINGLE QUOTES (') within field values, never double quotes inside values
      3. Avoid newlines or special characters in field values
      4. Keep responses brief and concise

      For ${domain}, include these fields:
      - ${domain}_summary: A brief summary
      - ${domain}_personality: Key characteristics
      - For kindred spirits (1-5): ${domain}_kindred_spirit_X, ${domain}_kindred_spirit_X_classic, ${domain}_kindred_spirit_X_rationale
      - For challenging voices (1-5): ${domain}_challenging_voice_X, ${domain}_challenging_voice_X_classic, ${domain}_challenging_voice_X_rationale`;
      
      const prompt = `Analyze these answers for ${domain} profile:\n${answers_json}\n\nFocus only on ${domain} aspects.`;
      
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
          max_tokens: 4000,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error for ${domain} subsection! status: ${response.status}`);
      }
      
      const data = await response.json();
      rawResponses.push(data);
      
      if (!data?.choices?.[0]?.message?.content) {
        console.error(`Unexpected API response structure for ${domain}:`, data);
        throw new Error(`Invalid API response structure for ${domain}`);
      }
      
      const rawContent = data.choices[0].message.content;
      const cleanedContent = cleanJsonContent(rawContent);
      
      try {
        const parsed = JSON.parse(cleanedContent);
        console.log(`Successfully parsed JSON for ${domain} subsection`);
        
        Object.assign(subsectionResults, parsed);
      } catch (parseError) {
        console.error(`JSON parsing failed for ${domain} subsection:`, parseError.message);
        
        const fallbackContent: Record<string, string> = {
          [`${domain}_summary`]: `Your ${domain} profile could not be processed correctly.`,
          [`${domain}_personality`]: `Error processing ${domain} personality traits.`
        };
        
        for (let i = 1; i <= 5; i++) {
          fallbackContent[`${domain}_kindred_spirit_${i}`] = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Thinker ${i}`;
          fallbackContent[`${domain}_kindred_spirit_${i}_classic`] = "Unknown (0000)";
          fallbackContent[`${domain}_kindred_spirit_${i}_rationale`] = "Error retrieving data";
          
          if (domain !== 'politics') {
            fallbackContent[`${domain}_challenging_voice_${i}`] = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Challenger ${i}`;
            fallbackContent[`${domain}_challenging_voice_${i}_classic`] = "Unknown (0000)";
            fallbackContent[`${domain}_challenging_voice_${i}_rationale`] = "Error retrieving data";
          }
        }
        
        if (domain === 'politics') {
          for (let i = 1; i <= 5; i++) {
            fallbackContent[`politics_challenging_voice_${i}`] = `Political Challenger ${i}`;
            fallbackContent[`politics_challenging_voice_${i}_classic`] = "Unknown (0000)";
            fallbackContent[`politics_challenging_voice_${i}_rationale`] = "Error retrieving data";
          }
        }
        
        Object.assign(subsectionResults, fallbackContent);
      }
    }
    
    console.log('Processing general section 2 fields');
    const generalSystemPrompt = `You are creating a philosophical profile summary. Return ONLY a valid JSON object with the following fields:
    - philosophical_type: A brief label for their overall philosophical type
    - philosophical_summary: A concise summary of their philosophical outlook
    
    Follow strict JSON formatting:
    1. Return ONLY a valid JSON object without markdown formatting
    2. Use SINGLE QUOTES (') within field values, never double quotes inside values
    3. Keep responses brief and concise`;
    
    const generalPrompt = `Based on these answers, provide a general philosophical profile:\n${answers_json}`;
    
    const generalResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            content: generalSystemPrompt
          },
          {
            role: 'user',
            content: generalPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (generalResponse.ok) {
      const generalData = await generalResponse.json();
      rawResponses.push(generalData);
      
      if (generalData?.choices?.[0]?.message?.content) {
        const rawGeneralContent = generalData.choices[0].message.content;
        const cleanedGeneralContent = cleanJsonContent(rawGeneralContent);
        
        try {
          const parsedGeneral = JSON.parse(cleanedGeneralContent);
          console.log('Successfully parsed general philosophy fields');
          Object.assign(subsectionResults, parsedGeneral);
        } catch (parseError) {
          console.error('Failed to parse general philosophy fields:', parseError.message);
          Object.assign(subsectionResults, {
            philosophical_type: "Undetermined",
            philosophical_summary: "Your philosophical profile could not be fully analyzed."
          });
        }
      }
    }
    
    console.log(`Successfully processed all section 2 subsections with ${Object.keys(subsectionResults).length} total fields`);
    
    return {
      content: subsectionResults,
      raw_response: rawResponses
    };
  } catch (error) {
    console.error('Error in section 2 split analysis:', error);
    
    const fallbackResponse: Record<string, string> = {
      error_message: `Failed to process section 2: ${error.message}`,
      philosophical_type: "Undetermined",
      philosophical_summary: "Your philosophical profile could not be fully analyzed."
    };
    
    for (const domain of domains) {
      fallbackResponse[`${domain}_summary`] = `Your ${domain} profile could not be processed correctly.`;
      fallbackResponse[`${domain}_personality`] = `Error processing ${domain} personality traits.`;
      
      for (let i = 1; i <= 5; i++) {
        fallbackResponse[`${domain}_kindred_spirit_${i}`] = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Thinker ${i}`;
        fallbackResponse[`${domain}_kindred_spirit_${i}_classic`] = "Unknown (0000)";
        fallbackResponse[`${domain}_kindred_spirit_${i}_rationale`] = "Error retrieving data";
        
        if (domain !== 'politics') {
          fallbackResponse[`${domain}_challenging_voice_${i}`] = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Challenger ${i}`;
          fallbackResponse[`${domain}_challenging_voice_${i}_classic`] = "Unknown (0000)";
          fallbackResponse[`${domain}_challenging_voice_${i}_rationale`] = "Error retrieving data";
        }
      }
    }
    
    for (let i = 1; i <= 5; i++) {
      fallbackResponse[`politics_challenging_voice_${i}`] = `Political Challenger ${i}`;
      fallbackResponse[`politics_challenging_voice_${i}_classic`] = "Unknown (0000)";
      fallbackResponse[`politics_challenging_voice_${i}_rationale`] = "Error retrieving data";
    }
    
    return {
      content: fallbackResponse,
      raw_response: {
        error: true,
        message: error.message
      }
    };
  }
}

function repairJson(jsonString: string, section: number): string {
  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch (e) {
    console.log(`Initial JSON parsing failed for section ${section}, attempting repairs:`, e.message);
    
    try {
      const standardized = standardizeJsonFormat(jsonString);
      
      JSON.parse(standardized);
      console.log(`Successfully repaired JSON for section ${section} with standardization`);
      return standardized;
    } catch (e2) {
      console.error(`Standardization failed for section ${section}: ${e2.message}`);
      
      if (section === 2) {
        console.log("Applying special section 2 repairs");
        
        try {
          const fields: Record<string, string> = {};
          
          const fieldPattern = /"([^"]+)"\s*:\s*"([^"]*)"/g;
          let match;
          
          while ((match = fieldPattern.exec(jsonString)) !== null) {
            const [_, key, value] = match;
            
            const cleanValue = value
              .replace(/\r?\n/g, ' ')
              .replace(/"/g, "'")
              .replace(/\t/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
              
            fields[key] = cleanValue;
          }
          
          for (let i = 1; i <= 5; i++) {
            const baseField = `politics_challenging_voice_${i}`;
            const classicField = `${baseField}_classic`;
            const rationaleField = `${baseField}_rationale`;
            
            if (!fields[baseField]) {
              console.log(`Adding missing field: ${baseField}`);
              fields[baseField] = `Political Challenger ${i}`;
            }
            
            if (!fields[classicField]) {
              console.log(`Adding missing field: ${classicField}`);
              fields[classicField] = "Unknown (0000)";
            }
            
            if (!fields[rationaleField]) {
              console.log(`Adding missing field: ${rationaleField}`);
              fields[rationaleField] = `This challenger represents a political position that contrasts with your views, but the specific details could not be processed correctly.`;
            }
          }
          
          const fixedJson = JSON.stringify(fields);
          console.log(`Created fixed JSON for section ${section} with ${Object.keys(fields).length} fields`);
          return fixedJson;
        } catch (e3) {
          console.error(`Pattern matching repair failed for section ${section}:`, e3.message);
          
          const fallbackResponse: Record<string, string> = {
            error_message: `Failed to parse section ${section}: ${e3.message}`,
            partial_content: jsonString.substring(0, 100) + "..."
          };
          
          if (section === 2) {
            for (let i = 1; i <= 5; i++) {
              fallbackResponse[`politics_challenging_voice_${i}`] = `Political Challenger ${i}`;
              fallbackResponse[`politics_challenging_voice_${i}_classic`] = "Unknown (0000)";
              fallbackResponse[`politics_challenging_voice_${i}_rationale`] = "Data could not be processed correctly.";
            }
          }
          
          return JSON.stringify(fallbackResponse);
        }
      } else {
        const basicCleanup = jsonString
          .replace(/,\s*}/g, '}')
          .replace(/,\s*\]/g, ']')
          .replace(/\\'/g, "'");
          
        try {
          JSON.parse(basicCleanup);
          return basicCleanup;
        } catch (e4) {
          console.error(`Basic cleanup failed for section ${section}:`, e4.message);
          return JSON.stringify({
            error_message: `Failed to parse section ${section}: ${e4.message}`,
            partial_content: jsonString.substring(0, 100) + "..."
          });
        }
      }
    }
  }
}

function getSystemPromptForSection(section: number): string {
  let systemPrompt = 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Return ONLY a JSON object with no additional formatting. The response must start with { and end with }. All field values must be properly escaped strings with no unescaped quotes or special characters. Follow the template exactly as specified.';
  
  if (section === 2) {
    systemPrompt = `You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). 

CRITICAL INSTRUCTIONS FOR JSON FORMATTING:
1. Return ONLY a valid JSON object without any markdown formatting
2. The response must start with { and end with }
3. Use SINGLE QUOTES (') for ANY quotations within field values, NEVER use double quotes (") inside field values
4. Avoid ALL newlines, tabs, or special characters in your field values
5. Every field must have a simple string value without complex formatting
6. IMPORTANT: Include ALL required fields in your response, especially all politics_challenging_voice fields (1-5) and their associated _classic and _rationale fields
7. Do not use backslashes except for escaping characters
8. Keep all explanations brief and concise to avoid parsing issues

Follow this exact format for each field:
"field_name": "field value with only single quotes inside if needed"`;
  }
  
  return systemPrompt;
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: Record<string, string>, raw_response: any }> {
  console.log(`Generating analysis for section ${section}`);
  
  if (section === 2) {
    return generateSection2Analysis(answers_json);
  }
  
  const prompt = getPromptForSection(section, answers_json);

  try {
    console.log(`Sending request to OpenRouter for section ${section}`);
    
    const systemPrompt = getSystemPromptForSection(section);
    
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
        max_tokens: 16000,
        temperature: section === 2 ? 0.3 : 0.7,
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
      
      return {
        content: parsed,
        raw_response: data
      };
    } catch (parseError) {
      console.error(`JSON parsing failed for section ${section}, attempting repairs:`, parseError.message);
      
      try {
        const repairedJson = repairJson(cleanedContent, section);
        const parsedResult = JSON.parse(repairedJson);
        
        console.log(`Successfully parsed JSON after repairs for section ${section}`);
        
        return {
          content: parsedResult,
          raw_response: data
        };
      } catch (repairError) {
        console.error(`JSON repair failed for section ${section}:`, repairError.message);
        
        const fallbackResponse: Record<string, string> = {
          error_message: `Failed to parse section ${section}: ${repairError.message}`,
          partial_content: cleanedContent.substring(0, 500) + "..."
        };
        
        if (section === 2) {
          for (let i = 1; i <= 5; i++) {
            fallbackResponse[`politics_challenging_voice_${i}`] = `Parsing Error: Challenger ${i}`;
            fallbackResponse[`politics_challenging_voice_${i}_classic`] = "Unknown (0000)";
            fallbackResponse[`politics_challenging_voice_${i}_rationale`] = "Error retrieving data";
            
            for (const domain of ['theology', 'epistemology', 'ethics', 'politics']) {
              fallbackResponse[`${domain}_kindred_spirit_${i}`] = `Parsing Error: Thinker ${i}`;
              fallbackResponse[`${domain}_kindred_spirit_${i}_classic`] = "Error (0000)";
              fallbackResponse[`${domain}_kindred_spirit_${i}_rationale`] = "Error retrieving data";
              
              if (domain !== 'politics') {
                fallbackResponse[`${domain}_challenging_voice_${i}`] = `Parsing Error: Challenger ${i}`;
                fallbackResponse[`${domain}_challenging_voice_${i}_classic`] = "Error (0000)";
                fallbackResponse[`${domain}_challenging_voice_${i}_rationale`] = "Error retrieving data";
              }
            }
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
      
      const analysisRecord = {
        assessment_id,
        name: assessmentData.name,
        profile_id,
        raw_response: combinedRawResponses,
        analysis_text: JSON.stringify(combinedAnalysisTexts),
        analysis_type: 'section_1',
        ...combinedAnalysis
      };

      console.log('Storing combined analysis in database...');
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
