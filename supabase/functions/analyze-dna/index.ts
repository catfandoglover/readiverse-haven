
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

async function generateAnalysis(answers_json: string, section: number): Promise<string> {
  const basePrompt = `#Background
Metaframework of philosophical DNA

[Decision tree diagrams omitted for brevity but included in analysis]

Important: Always write your response in the second person, addressing the subject directly as "you". For example, use phrases like "Your philosophical DNA...", "You tend to...", "Your approach is...".`;

  let sectionPrompt = '';
  
  if (section === 1) {
    sectionPrompt = `
# Philosophical Profile Generator Guidelines

## Input Required
Analysis of answers from the philosophical decision trees representing your philosophical DNA.

## Output Structure Required for this Section

### Primary Section
[Domain Archetype] [Brief poetic subtitle capturing your essence]

[Single paragraph capturing your philosophical essence - focus on how you reconcile contradictions and approach problem-solving]

### Core Dynamics
- Key Tensions in your thinking (3)
- Your Natural Strengths (3)
- Your Growth Edges (3)

### Domain Analyses (Only Theology and Ontology for this section)
One sentence per domain capturing your characteristic approach

### Thinker Analysis (Only for Theology and Ontology)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach`;
  } else if (section === 2) {
    sectionPrompt = `
### Domain Analyses (Only Epistemology and Ethics for this section)
One sentence per domain capturing your characteristic approach

### Thinker Analysis (Only for Epistemology and Ethics)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach`;
  } else {
    sectionPrompt = `
### Domain Analyses (Only Politics and Aesthetics for this section)
One sentence per domain capturing your characteristic approach

### Thinker Analysis (Only for Politics and Aesthetics)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach

## Concluding Analysis
Brief synthesis of your overall philosophical profile, highlighting key themes and potential directions for your development.`;
  }

  const fullPrompt = `${basePrompt}

Here are your answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>

${sectionPrompt}

Remember to:
1. Always use second person ("you", "your") throughout the analysis
2. Format your response with XML-style tags appropriate for this section
3. Make the analysis feel personal and directly addressed to the subject`;

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
          content: fullPrompt
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

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Generate all three sections sequentially
    console.log('Generating section 1...');
    const section1 = await generateAnalysis(answers_json, 1);
    console.log('Generating section 2...');
    const section2 = await generateAnalysis(answers_json, 2);
    console.log('Generating section 3...');
    const section3 = await generateAnalysis(answers_json, 3);

    // Combine all sections
    const completeAnalysis = `${section1}\n\n${section2}\n\n${section3}`;

    // Store the complete analysis in Supabase using the original schema
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert({
        assessment_id: assessmentId,
        analysis_type: 'CLAUDE',
        analysis_text: completeAnalysis,
        raw_response: {
          section1,
          section2,
          section3
        }
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

