
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

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: string, raw_response: any }> {
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
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always structure your response exactly according to the XML template provided, filling in each section thoughtfully while maintaining the tags.'
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
    return {
      content: data.choices[0].message.content,
      raw_response: data
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
}

// Function to aggregate all three sections of analysis
async function generateCompleteAnalysis(answers_json: string): Promise<{ analysis: string, raw_responses: any[] }> {
  const section1 = await generateAnalysis(answers_json, 1);
  const section2 = await generateAnalysis(answers_json, 2);
  const section3 = await generateAnalysis(answers_json, 3);
  
  return {
    analysis: `${section1.content}\n${section2.content}\n${section3.content}`,
    raw_responses: [section1.raw_response, section2.raw_response, section3.raw_response]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { answers_json, assessment_id } = await req.json();
      
      if (!answers_json || !assessment_id) {
        throw new Error('Missing required fields: answers_json and assessment_id are required');
      }

      // Generate complete analysis text combining all three sections
      const { analysis, raw_responses } = await generateCompleteAnalysis(answers_json);
      
      // Store complete analysis in the database
      const { error: storeError } = await supabase.from('dna_analysis_results').insert({
        assessment_id: assessment_id,
        analysis_text: analysis,
        analysis_type: 'section_1', // Since we're now storing everything in one entry
        raw_response: raw_responses // Store the raw responses as JSONB
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
