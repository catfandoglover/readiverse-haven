
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

    // Prepare the prompt for Claude with the framework context
    const prompt = `I have built a metaframework to understand a user's intellectual DNA, broken down into 6 categories: aesthetics, ontology, ethics, epistemology, politics, theology. Each category contains a sequence of binary answers (A/B) representing the person's choices through a carefully designed decision tree that explores fundamental philosophical questions.

The framework is designed to decode one's intellectual ancestry and philosophical worldview by analyzing their responses to key questions in each domain. Each answer sequence represents a path through a complex decision tree of philosophical positions.

Here are the answers provided for each category:

Ethics: ${answers.ETHICS || 'Not answered'}
Epistemology: ${answers.EPISTEMOLOGY || 'Not answered'}
Politics: ${answers.POLITICS || 'Not answered'}
Theology: ${answers.THEOLOGY || 'Not answered'}
Ontology: ${answers.ONTOLOGY || 'Not answered'}
Aesthetics: ${answers.AESTHETICS || 'Not answered'}

Based on these answer sequences, please:

1. Create a profile with:
   - A mythopoetic title that captures their philosophical essence
   - Their key intellectual lineages and philosophical ancestors
   - Notable patterns or unique combinations in their thinking

2. Analyze:
   - Their core philosophical commitments
   - Potential tensions or harmonies between different aspects of their worldview
   - How their views in one domain influence or relate to others

3. Reflect on:
   - The broader implications of their philosophical outlook
   - How their worldview might shape their approach to contemporary challenges
   - Potential areas for intellectual growth or exploration

Please write this analysis in an engaging, narrative style that balances academic insight with accessible language. Focus on making meaningful connections between their various philosophical positions while maintaining intellectual rigor.`;

    // Call Claude API with the Sonnet model
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
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
