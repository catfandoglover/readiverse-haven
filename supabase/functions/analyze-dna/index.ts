
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

async function generateCompleteAnalysis(answers_json: string): Promise<{ sections: Array<{ analysis: Record<string, string>, raw_response: any }>, error?: string }> {
  try {
    // Process only the third section which is the complete one
    console.log('Starting analysis for section 3 (complete entry)...');
    const section3 = await generateAnalysis(answers_json, 3);
    
    // Check if section 3 was successful
    const hasErrors = section3.content.error !== undefined;
    
    if (hasErrors) {
      console.warn('Section 3 had errors, falling back to full processing...');
      
      // If section 3 failed, try processing all sections as a fallback
      console.log('Starting analysis for section 1...');
      const section1 = await generateAnalysis(answers_json, 1);
      
      console.log('Starting analysis for section 2...');
      const section2 = await generateAnalysis(answers_json, 2);
      
      // Try section 3 again if it failed
      console.log('Retrying analysis for section 3...');
      const retrySection3 = await generateAnalysis(answers_json, 3);
      
      return {
        sections: [
          { analysis: section1.content, raw_response: section1.raw_response },
          { analysis: section2.content, raw_response: section2.raw_response },
          { analysis: retrySection3.content, raw_response: retrySection3.raw_response }
        ]
      };
    }
    
    // If section 3 succeeded, return only section 3 (as the third element)
    // but with placeholder empty objects for sections 1 and 2
    console.log('Section 3 completed successfully, using only this section');
    return {
      sections: [
        { analysis: {}, raw_response: {} },  // Empty placeholder for section 1
        { analysis: {}, raw_response: {} },  // Empty placeholder for section 2
        { analysis: section3.content, raw_response: section3.raw_response }  // Complete section 3
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
      
      const { sections } = result;
      
      // Extract only section 3 (the complete one)
      const completeSection = sections[2]; // Section 3 is at index 2
      
      // Combine all data into a single record, using only the complete section
      const combinedAnalysis = {
        assessment_id,
        name: assessmentData.name,
        profile_image_url,
        raw_response: [completeSection.raw_response],  // Include only the raw response from section 3
        analysis_text: JSON.stringify([completeSection.analysis]), // Include only the analysis from section 3
        analysis_type: 'section_3', // Changed to indicate we're using only section 3
        ...completeSection.analysis,  // Include all fields from the complete section
      };

      // Store everything in a single record
      console.log('Storing analysis in database...');
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(combinedAnalysis);

      if (storeError) {
        console.error('Error storing combined analysis:', storeError);
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
