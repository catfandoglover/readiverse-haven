
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
        model: 'anthropic/claude-3.7-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Return ONLY a JSON object - no markdown, no code blocks, no backticks, no formatting. The response should start with { and end with } without any other characters. Include all fields from the template exactly as specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
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

    let rawContent = data.choices[0].message.content;
    console.log('Raw AI response for section', section, ':', rawContent.substring(0, 200) + '...');
    
    // Pre-process the content to remove any potential markdown or code blocks
    let preprocessedContent = rawContent
      .replace(/```json\s*/g, '')  // Remove opening ```json
      .replace(/```\s*/g, '')      // Remove closing ```
      .replace(/`/g, '')           // Remove all backticks
      .trim();                     // Clean up whitespace
    
    // Try multiple approaches to extract and parse the JSON
    let parsedContent: Record<string, string>;
    
    try {
      // First attempt: Direct parsing of preprocessed content
      parsedContent = JSON.parse(preprocessedContent);
      console.log('Successfully parsed JSON after preprocessing');
    } 
    catch (e) {
      console.error('First parsing attempt failed:', e);
      
      try {
        // Second attempt: Try more aggressive sanitization
        const sanitized = preprocessedContent
          .replace(/,\s*}/g, '}')      // Remove trailing commas in objects
          .replace(/,\s*\]/g, ']')     // Remove trailing commas in arrays
          .replace(/\n/g, ' ')         // Replace newlines with spaces
          .replace(/\s+/g, ' ')        // Normalize whitespace
          .trim();
        
        parsedContent = JSON.parse(sanitized);
        console.log('Successfully parsed JSON after sanitizing');
      } 
      catch (e2) {
        console.error('Second parsing attempt failed:', e2);
        
        try {
          // Third attempt: Try to extract JSON using regex
          const jsonPattern = /\{[\s\S]*\}/; // Match anything between { and }
          const match = preprocessedContent.match(jsonPattern);
          
          if (match) {
            const extractedJson = match[0];
            parsedContent = JSON.parse(extractedJson);
            console.log('Successfully parsed JSON using regex extraction');
          } else {
            throw new Error('No JSON object found in response');
          }
        } 
        catch (e3) {
          console.error('Third parsing attempt failed:', e3);

          try {
            // Fourth attempt: Manual JSON reconstruction
            // This is a last resort for badly malformed JSON
            const fieldPattern = /"([^"]+)":\s*"([^"]*)"/g;
            let matches;
            const fields: Record<string, string> = {};
            
            while ((matches = fieldPattern.exec(preprocessedContent)) !== null) {
              const key = matches[1];
              const value = matches[2];
              fields[key] = value;
            }
            
            if (Object.keys(fields).length > 0) {
              parsedContent = fields;
              console.log('Successfully extracted fields using regex pattern matching');
            } else {
              throw new Error('Could not extract fields from response');
            }
          }
          catch (e4) {
            console.error('All parsing attempts failed');
            
            // Create a fallback response with error information
            parsedContent = {
              error: 'Could not parse AI response',
              section: `Section ${section}`,
              partial_content: preprocessedContent.substring(0, 500) + '...' // Include beginning of response for debugging
            };
          }
        }
      }
    }

    return {
      content: parsedContent,
      raw_response: data
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    
    // Return a structured error response
    return {
      content: {
        error: `Error in section ${section}: ${error.message}`,
        section: `Section ${section}`,
        status: 'failed'
      },
      raw_response: { error: error.message }
    };
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ section3: { analysis: Record<string, string>, raw_response: any }, error?: string }> {
  try {
    // Process only section 3 initially, which contains the complete analysis
    console.log('Starting analysis for section 3 (complete analysis)...');
    const section3 = await generateAnalysis(answers_json, 3);
    
    // Check if section 3 had errors
    if (section3.content.error) {
      console.warn('Section 3 had errors, falling back to processing all sections');
      
      // Fallback to processing all sections
      console.log('Starting analysis for section 1...');
      const section1 = await generateAnalysis(answers_json, 1);
      
      console.log('Starting analysis for section 2...');
      const section2 = await generateAnalysis(answers_json, 2);

      // Re-attempt section 3
      console.log('Re-attempting analysis for section 3...');
      const retrySection3 = await generateAnalysis(answers_json, 3);
      
      return {
        section3: { 
          analysis: retrySection3.content,
          raw_response: retrySection3.raw_response 
        }
      };
    }
    
    return {
      section3: { 
        analysis: section3.content,
        raw_response: section3.raw_response 
      }
    };
  } catch (error) {
    console.error('Error in generateCompleteAnalysis:', error);
    return {
      section3: {
        analysis: {
          error: `Failed to generate section 3 analysis: ${error.message}`,
          status: 'failed'
        },
        raw_response: { error: error.message }
      },
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
      console.log('Answers JSON first 100 chars:', answers_json.substring(0, 100) + '...');

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
      
      const { section3 } = result;
      
      // Filter out any error fields from the analysis content
      const filteredAnalysis = { ...section3.analysis };
      if ('error' in filteredAnalysis) {
        delete filteredAnalysis.error;
      }
      if ('status' in filteredAnalysis) {
        delete filteredAnalysis.status;
      }
      if ('section' in filteredAnalysis) {
        delete filteredAnalysis.section;
      }
      if ('partial_content' in filteredAnalysis) {
        delete filteredAnalysis.partial_content;
      }
      
      console.log('Successfully processed section 3');
      
      // Count valid fields to log success rate
      const fieldCount = Object.keys(filteredAnalysis).length;
      console.log(`Section 3 contains ${fieldCount} valid fields`);
      
      // Store only section 3 results
      const combinedAnalysis = {
        assessment_id,
        name: assessmentData.name,
        profile_image_url,
        raw_response: [section3.raw_response], // Store only section 3 raw response
        analysis_text: JSON.stringify([filteredAnalysis]), // Store only section 3 analysis
        analysis_type: 'section_3', // Explicitly mark as section 3
        ...filteredAnalysis // Include all fields from section 3
      };

      // Store everything in a single record
      console.log('Storing analysis in database...');
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(combinedAnalysis);

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
