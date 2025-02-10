
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

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
    // Verify API key configuration
    console.log('Checking OpenRouter API key configuration...');
    if (!openrouterApiKey) {
      console.error('OpenRouter API key is not configured');
      throw new Error('OpenRouter API key is not configured');
    }
    console.log('OpenRouter API key is configured');

    const { assessmentId, answers } = await req.json();
    
    console.log('Processing DNA analysis for assessment:', assessmentId);
    console.log('Answers:', answers);

    // Fetch the user's name from the assessment
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('dna_assessment_results')
      .select('name')
      .eq('id', assessmentId)
      .single();

    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError);
      throw assessmentError;
    }

    const userName = assessmentData.name;
    console.log('Found user name:', userName);

    // Format answers_json for the prompt, including the user's name
    const answers_json = JSON.stringify({ name: userName, answers }, null, 2);

    // Prepare the prompt for the models with the new framework
    const prompt = `#Background
Metaframework of philosophical DNA

[Decision tree diagrams omitted for brevity but included in analysis]

#First steps

Here are the user's answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>

# Philosophical Profile Generator Guidelines...`; // ... keep existing code (rest of the prompt)

    console.log('Sending requests to OpenRouter API with required headers...');
    
    // Make parallel requests to both models
    const [sonnetResponse, deepseekResponse] = await Promise.all([
      // Request for Claude-3-Sonnet
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterApiKey}`,
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'DNA Analysis - Sonnet'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-sonnet',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7
        })
      }),
      // Request for Deepseek
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterApiKey}`,
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'DNA Analysis - Deepseek'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-distill-llama-8b',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7
        })
      })
    ]);

    if (!sonnetResponse.ok || !deepseekResponse.ok) {
      const errorText = await sonnetResponse.text();
      console.error('OpenRouter API error:', sonnetResponse.status, errorText);
      throw new Error(`OpenRouter API returned status ${sonnetResponse.status}: ${errorText}`);
    }

    const [sonnetData, deepseekData] = await Promise.all([
      sonnetResponse.json(),
      deepseekResponse.json()
    ]);

    console.log('Received responses from OpenRouter:', { sonnetData, deepseekData });

    // Extract the generated texts
    const sonnetAnalysis = sonnetData.choices[0].message.content;
    const deepseekAnalysis = deepseekData.choices[0].message.content;

    // Store both analyses in Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert([
        {
          assessment_id: assessmentId,
          analysis_type: 'CLAUDE_SONNET',
          analysis_text: sonnetAnalysis,
          raw_response: sonnetData
        },
        {
          assessment_id: assessmentId,
          analysis_type: 'DEEPSEEK',
          analysis_text: deepseekAnalysis,
          raw_response: deepseekData
        }
      ])
      .select();

    if (analysisError) {
      console.error('Error storing analyses:', analysisError);
      throw analysisError;
    }

    console.log('Analyses stored successfully:', analysisData);

    return new Response(
      JSON.stringify({ analyses: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-dna function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

