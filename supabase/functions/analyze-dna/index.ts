
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
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always return your response as a valid JSON object with the exact field names specified in the template.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        // Add a max_tokens parameter to ensure complete responses
        max_tokens: 4000,
        // Reduce temperature for more stable, predictable outputs
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

    const rawContent = data.choices[0].message.content;
    console.log('Raw AI response for section', section, ':', rawContent);
    
    // Improved JSON parsing with error handling
    let parsedContent: Record<string, string>;
    try {
      // First attempt: direct parsing
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.error('Raw content:', rawContent);
      
      // Second attempt: Try to sanitize common JSON issues
      try {
        // Remove any trailing commas that might be causing issues
        const sanitized = rawContent.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        parsedContent = JSON.parse(sanitized);
      } catch (e2) {
        console.error('Second parsing attempt failed:', e2);
        
        // Third attempt: Try to extract JSON using regex
        try {
          const match = rawContent.match(/\{[\s\S]*\}/);
          if (match) {
            parsedContent = JSON.parse(match[0]);
          } else {
            throw new Error('No JSON object found in response');
          }
        } catch (e3) {
          console.error('All parsing attempts failed');
          
          // Create a fallback response with error information
          parsedContent = {
            error: 'Could not parse AI response',
            section: `Section ${section}`,
            partial_content: rawContent.substring(0, 500) + '...' // Include beginning of response for debugging
          };
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
    const section1 = await generateAnalysis(answers_json, 1);
    const section2 = await generateAnalysis(answers_json, 2);
    const section3 = await generateAnalysis(answers_json, 3);
    
    // Check if any section had errors
    const hasErrors = [section1, section2, section3].some(section => section.content.error);
    
    if (hasErrors) {
      console.warn('Some sections had errors, but proceeding with available data');
    }
    
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

      const result = await generateCompleteAnalysis(answers_json);
      
      if (result.error) {
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
      
      // Filter out any error fields from the analysis content
      const filteredSections = sections.map(section => {
        const filteredAnalysis = { ...section.analysis };
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
        return {
          analysis: filteredAnalysis,
          raw_response: section.raw_response
        };
      });
      
      // Combine all sections into a single record
      const combinedAnalysis = {
        assessment_id,
        name: assessmentData.name,
        profile_image_url,
        raw_response: filteredSections.map(s => s.raw_response),
        analysis_text: JSON.stringify(filteredSections.map(s => s.analysis)),
        analysis_type: 'section_1', // Using a valid enum value from dna_result_type
        ...filteredSections[0].analysis, // General profile
        ...filteredSections[1].analysis, // Theology, Epistemology, Ethics, Politics
        ...filteredSections[2].analysis  // Ontology and Aesthetics
      };

      // Log the combined data
      console.log('Combined analysis data:', combinedAnalysis);

      // Store everything in a single record
      const { error: storeError } = await supabase
        .from('dna_analysis_results')
        .insert(combinedAnalysis);

      if (storeError) {
        console.error('Error storing combined analysis:', storeError);
        throw storeError;
      }
      
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
