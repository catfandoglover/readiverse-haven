
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

    // Prepare the prompt for the model with the new framework
    const prompt = `#Background
Metaframework of philosophical DNA

[Decision tree diagrams omitted for brevity but included in analysis]

#First steps

Here are the user's answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>

# Philosophical Profile Generator Guidelines

## Input Required
Six 5-letter sequences (XXXXX) representing paths through philosophical decision trees in:
- Theology
- Ontology 
- Epistemology
- Ethics
- Politics
- Aesthetics

Extract and analyze the 5-letter answer sequences for each philosophical category from the answers JSON

## Output Structure

### Primary Section
[Domain Archetype] [Brief poetic subtitle]

[Single paragraph capturing philosophical essence - focus on reconciliation of contradictions and problem-solving approach]

### Core Dynamics
- Key Tensions (3)
- Natural Strengths (3)
- Growth Edges (3)

### Domain Analyses
One sentence per domain capturing characteristic approach

### Thinker Analysis
For each domain (Theology, Ontology, Epistemology, Ethics, Politics, Aesthetics):

**Kindred Spirits** (5 per domain):
- Thinker, Work (date) - key argument

**Challenging Voices** (5 per domain):
- Thinker, Work (date) - key argument

## Requirements

### Temporal Distribution
- No thinkers after 1980
- Minimum 20% pre-medieval thinkers
- Representative spread across available periods

### Cultural Distribution
- 70% Western philosophical traditions
- 30% Non-Western philosophical traditions

### Selection Criteria
- Mix of iconic and lesser-known influential voices
- Thinkers must reflect specific decision tree paths
- Arguments summarized in one distinctive line
- Each thinker paired with most relevant major work
- Maintain diverse perspectives within constraints

### Domain Description Requirements
- Specific to individual's pattern
- Avoid generic characterizations
- Connect to decision tree choices

### Archetype Generation
Use provided first/second word elements based on pattern analysis:
- Analyze ratio and sequence
- Select from domain-specific options
- Apply integration rules
- Verify metaphoric coherence

Remember to format your response with XML-style tags:

<basic_info>
<name>
[User's name from answers_json]
</name>

<mythopoetic_title>
[Generated title following the archetype system]
</mythopoetic_title>

[Include other domain tags and analysis as before...]
</basic_info>

<profile>
[Generated profile following the new guidelines]
</profile>`;

    console.log('Sending request to OpenRouter API...');
    
    // Make the API request to OpenRouter with proper headers and model specification
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'DNA Analysis',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 25000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
        stop: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
    }

    const openRouterResponse = await response.json();
    console.log('Received response from OpenRouter:', openRouterResponse);

    // Extract the generated text from OpenRouter's response
    const generatedText = openRouterResponse.choices[0].message.content;
    console.log('Extracted analysis text:', generatedText);

    // Store the analysis in Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert({
        assessment_id: assessmentId,
        analysis_type: 'CLAUDE',
        analysis_text: generatedText,
        raw_response: openRouterResponse
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

