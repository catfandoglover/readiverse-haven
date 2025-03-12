
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
  let result = jsonString
    .replace(/\n/g, ' ')         // Replace newlines with spaces
    .replace(/\r/g, ' ')         // Replace carriage returns
    .replace(/\t/g, ' ')         // Replace tabs
    .replace(/\\'/g, "'")        // Fix escaped single quotes
    .replace(/\\\\/g, '\\')      // Fix double backslashes
    .replace(/,\s*}/g, '}')      // Remove trailing commas in objects
    .replace(/,\s*\]/g, ']')     // Remove trailing commas in arrays
    .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
    .replace(/\\\\\"/g, '\\"')   // Fix double-escaped quotes
    .replace(/\s+/g, ' ');       // Normalize whitespace
    
  return result;
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: Record<string, string>, raw_response: any }> {
  console.log(`Generating analysis for section ${section}`);
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
    console.log(`Processing content for section ${section}`);
    
    // Clean and repair the JSON content
    const cleanedContent = cleanJsonContent(rawContent);
    const repairedContent = repairJson(cleanedContent);
    
    try {
      // Attempt to parse the processed content
      const parsed = JSON.parse(repairedContent);
      console.log(`Successfully parsed JSON for section ${section}`);
      return {
        content: parsed,
        raw_response: data
      };
    } catch (parseError) {
      console.error(`JSON parsing failed for section ${section}:`, parseError);
      
      // Fallback to regex extraction
      const fieldPattern = /"([^"]+)":\s*"([^"]*)"/g;
      const fields: Record<string, string> = {};
      let matches;
      
      while ((matches = fieldPattern.exec(repairedContent)) !== null) {
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
  } catch (error) {
    console.error(`Error in section ${section}:`, error);
    throw error;
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ sections: Array<{ analysis: Record<string, string>, raw_response: any }>, error?: string }> {
  try {
    // Only process section 3 initially
    console.log('Starting analysis for section 3...');
    const section3 = await generateAnalysis(answers_json, 3);
    
    // If section 3 has valid content, store only that
    if (section3.content && !section3.content.error) {
      console.log('Successfully generated section 3 analysis');
      return {
        sections: [
          { analysis: {}, raw_response: null },
          { analysis: {}, raw_response: null },
          { analysis: section3.content, raw_response: section3.raw_response }
        ]
      };
    }
    
    // Fallback: process all sections if section 3 failed
    console.log('Section 3 failed, processing all sections as fallback...');
    const section1 = await generateAnalysis(answers_json, 1);
    const section2 = await generateAnalysis(answers_json, 2);
    
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
      
      // Only use the third section for storage
      const thirdSection = result.sections[2];
      
      // Store only the third section analysis
      const analysisRecord = {
        assessment_id,
        name: assessmentData.name,
        profile_image_url,
        raw_response: [thirdSection.raw_response], // Store as array for consistency
        analysis_text: JSON.stringify([thirdSection.analysis]),
        analysis_type: 'section_3',
        ...thirdSection.analysis
      };

      console.log('Storing analysis in database...');
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(analysisRecord);

      if (storeError) {
        console.error('Error storing analysis:', storeError);
        throw storeError;
      }
      
      console.log('Analysis stored successfully');
      
      return new Response(
        JSON.stringify({ success: true, message: 'Analysis stored successfully' }),
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
