
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
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
    const { assessmentId, answers } = await req.json();
    
    console.log('Processing DNA analysis for assessment:', assessmentId);
    console.log('Answers:', answers);

    // Prepare the prompt for Claude
    const prompt = `Below are the answers to a philosophical assessment categorized by different areas of philosophy. Each category contains a sequence of binary answers (A/B) representing the person's choices through a decision tree. Please analyze these answers and provide insights about the person's philosophical worldview:

Ethics: ${answers.ETHICS || 'Not answered'}
Epistemology: ${answers.EPISTEMOLOGY || 'Not answered'}
Politics: ${answers.POLITICS || 'Not answered'}
Theology: ${answers.THEOLOGY || 'Not answered'}
Ontology: ${answers.ONTOLOGY || 'Not answered'}
Aesthetics: ${answers.AESTHETICS || 'Not answered'}

Please provide a comprehensive analysis of their philosophical worldview based on these answers. Include potential contradictions, interesting patterns, and what these choices might reveal about their deeper beliefs and values.`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const claudeResponse = await response.json();
    console.log('Received response from Claude:', claudeResponse);

    if (!claudeResponse.content || !claudeResponse.content[0].text) {
      throw new Error('Invalid response from Claude API');
    }

    const analysisText = claudeResponse.content[0].text;

    // Store the analysis in Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert({
        assessment_id: assessmentId,
        analysis_type: 'CLAUDE',
        analysis_text: analysisText,
        raw_response: claudeResponse
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw analysisError;
    }

    console.log('Analysis stored successfully:', analysisData);

    return new Response(
      JSON.stringify({ analysis: analysisData }),
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
