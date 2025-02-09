
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

    // Prepare the prompt for Claude with the enhanced framework
    const prompt = `You are a sophisticated AI tasked with creating personalized philosophical profiles based on users' responses to a series of questions. Your goal is to interpret these responses and craft a mythopoetic narrative that captures the essence of the individual's worldview.

I have built a metaframework to understand a user's intellectual DNA, broken down into 6 categories: aesthetics, ontology, ethics, epistemology, politics, theology. Each category contains a sequence of binary answers (A/B) representing the person's choices through a carefully designed decision tree that explores fundamental philosophical questions.

First, here are the user's answers to the philosophical questions:

Ethics: ${answers.ETHICS || 'Not answered'}
Epistemology: ${answers.EPISTEMOLOGY || 'Not answered'}
Politics: ${answers.POLITICS || 'Not answered'}
Theology: ${answers.THEOLOGY || 'Not answered'}
Ontology: ${answers.ONTOLOGY || 'Not answered'}
Aesthetics: ${answers.AESTHETICS || 'Not answered'}

Please analyze these answers and create a profile for the user. Follow these steps:

1. Extract the 5-letter answer sequences for each philosophical category from the answers.

2. Based on your analysis of the answer sequences, generate a mythopoetic title that poetically captures the essence of their philosophical leanings.

3. Create a list of basic information in this format:

<name>
[Generated Name]
</name>

<mythopoetic_title>
[Generated Mythopoetic Title]
</mythopoetic_title>

<theology>
[5-letter answer sequence]
</theology>

<ontology>
[5-letter answer sequence]
</ontology>

<epistemology>
[5-letter answer sequence]
</epistemology>

<ethics>
[5-letter answer sequence]
</ethics>

<politics>
[5-letter answer sequence]
</politics>

<aesthetics>
[5-letter answer sequence]
</aesthetics>

4. Work through your interpretation:
a. Extract and list the 5-letter answer sequences for each category
b. Interpret the meaning of each sequence
c. Identify connections between different philosophical categories
d. Consider how each philosophical category might influence the others
e. Brainstorm mythopoetic themes and imagery based on your interpretations
f. Think about potential mythological or archetypal figures that align with the user's philosophical profile

5. Write a narrative prose profile that:
- Weaves together the user's philosophical tendencies into a cohesive and poetic description
- Reflects their worldview across all six categories
- Makes meaningful connections between their various philosophical positions
- Balances academic insight with accessible language
- Maintains intellectual rigor while being engaging

Format your response exactly like this:

<basic_info>
[List of basic information as specified above]
</basic_info>

<profile>
[Your narrative prose profile]
</profile>`;

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
