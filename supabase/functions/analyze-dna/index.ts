
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

    // Prepare the prompt for the model with the enhanced framework
    const prompt = `I have built a metaframework to understand a user's intellectual DNA, broken down into 6 categories: aesthetics, ontology, ethics, epistemology, politics, theology. Each category represents a complex tree of philosophical inquiry, where each answer leads to deeper, more nuanced questions.

First, here are the user's answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>

Please analyze these answers and create a profile for the user. Your response should be at the level of a PhD student in philosophy with the inspirational tone and rigor of Maria Montessori, who believed in the profound capacity of each individual to develop their intellectual and spiritual potential.

Context on the Mission and Purpose:
Your thoughts have ancestors. Every idea you hold has been shaped by the great conversation that spans human history. From Sappho's understanding of love to Popper's theory of knowledge, from Mencius's ethics to Aquinas's theology, we are all part of an ongoing dialogue with the past.

Learning is not just about acquiring information—it is a transformative practice that can change your life. The history of thought is not simply a catalogue of theories that are either right or wrong, but a great conversation that you can join.

Steps for Analysis:

1. Extract and analyze the 5-letter answer sequences for each philosophical category:
- THEOLOGY: Exploring questions of divine reality, faith, and ultimate meaning
- ONTOLOGY: Investigating the nature of being, reality, and existence
- EPISTEMOLOGY: Examining how we know what we know
- ETHICS: Contemplating right action and the nature of goodness
- POLITICS: Understanding power, justice, and collective organization
- AESTHETICS: Exploring beauty, art, and sensory experience

2. For each category, provide:
a) The 5-letter sequence derived from their answers
b) A brief interpretation of what this sequence reveals about their philosophical orientation
c) Connections to major thinkers and traditions that align with their viewpoint

3. Generate a mythopoetic title that captures the essence of their philosophical DNA. This should be both poetic and philosophically precise.

4. Create a narrative profile that:
a) Weaves together their philosophical tendencies into a coherent worldview
b) Identifies the intellectual lineage their thinking follows
c) Suggests paths for further philosophical exploration
d) Connects their theoretical orientations to practical implications

Format your response as follows:

<basic_info>
<name>
[Their provided name from the answers_json]
</name>

<mythopoetic_title>
[A title that poetically captures their philosophical essence]
</mythopoetic_title>

<theology>
[5-letter sequence] - [Brief interpretation]
</theology>

<ontology>
[5-letter sequence] - [Brief interpretation]
</ontology>

<epistemology>
[5-letter sequence] - [Brief interpretation]
</epistemology>

<ethics>
[5-letter sequence] - [Brief interpretation]
</ethics>

<politics>
[5-letter sequence] - [Brief interpretation]
</politics>

<aesthetics>
[5-letter sequence] - [Brief interpretation]
</aesthetics>
</basic_info>

<profile>
[Write a thorough, academically rigorous yet inspirational analysis that:
- Examines the interplay between their various philosophical positions
- Connects their thinking to historical philosophical traditions
- Suggests directions for further intellectual exploration
- Reflects on the practical implications of their philosophical orientation
The tone should combine philosophical depth with the warmth and encouragement of a wise mentor.]
</profile>

Remember that this analysis should serve not just as a description of their current philosophical position, but as an invitation to deeper engagement with the great conversation of human thought.`;

    console.log('Sending request to OpenRouter API with required headers...');
    
    // Call OpenRouter API with proper headers and error handling
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterApiKey}`,
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'DNA Analysis'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-sonnet',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7
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

