
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

  console.log(`Generating analysis for section ${section} with prompt:`, prompt);
  console.log('Using answers:', answers_json);

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
        model: 'anthropic/claude-3-sonnet',
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
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
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

      console.log('Received request with:', { assessment_id, profile_image_url });
      console.log('Answers JSON:', answers_json);

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

      try {
        const section1 = await generateAnalysis(answers_json, 1);
        const section2 = await generateAnalysis(answers_json, 2);
        const section3 = await generateAnalysis(answers_json, 3);
        
        // Merge all sections
        const analysis = {
          ...section1.content,
          ...section2.content,
          ...section3.content
        };
        
        // Log the database insert data
        console.log('Database insert data:', {
          assessment_id,
          name: assessmentData.name,
          profile_image_url,
          raw_responses: [section1.raw_response, section2.raw_response, section3.raw_response],
          ...analysis
        });

        const { error: storeError } = await supabase.from('dna_analysis_results').insert({
          assessment_id: assessment_id,
          name: assessmentData.name,
          profile_image_url: profile_image_url,
          analysis_text: JSON.stringify(analysis),
          analysis_type: 'section_1',
          raw_response: [section1.raw_response, section2.raw_response, section3.raw_response],
          ...analysis
        });

        if (storeError) {
          console.error('Error storing analysis:', storeError);
          throw storeError;
        }
        
        return new Response(
          JSON.stringify({ analysis }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          },
        );
      } catch (analysisError) {
        console.error('Error in analysis generation:', analysisError);
        throw analysisError;
      }
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
