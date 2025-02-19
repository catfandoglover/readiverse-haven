
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getPromptForSection } from "./prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers_json, section, assessment_id } = await req.json();
    
    if (!answers_json || !section || !assessment_id) {
      throw new Error('Missing required parameters');
    }

    const prompt = getPromptForSection(section);
    console.log(`Analyzing section ${section} with prompt:`, prompt);

    const { system_prompt, output_format } = prompt;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `${system_prompt}\n\nPlease provide your analysis in the following JSON format:\n${JSON.stringify(output_format, null, 2)}`
          },
          {
            role: 'user',
            content: answers_json
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const completion = await openAIResponse.json();
    const analysis = JSON.parse(completion.choices[0].message.content);
    console.log('Analysis completed:', analysis);

    // Update the assessment with the analysis
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('dna_analysis_results')
      .upsert({
        assessment_id,
        analysis_type: 'section_' + section,
        raw_response: analysis,
        ...analysis // Spread the analysis fields directly
      });

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-dna function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
