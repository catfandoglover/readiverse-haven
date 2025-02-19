
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Analyzing DNA section:', section, 'for assessment:', assessment_id);

    if (!answers_json || !section || !assessment_id) {
      throw new Error('Missing required parameters');
    }

    const answers = JSON.parse(answers_json);
    const prompt = getPromptForSection(section);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: JSON.stringify(answers) }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResult = await openAIResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Update the assessment with the analysis
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let updateData = {};
    switch (section) {
      case 1:
        updateData = {
          theology_analysis: analysis.theology_analysis,
          ontology_analysis: analysis.ontology_analysis,
          theology_ontology_frameworks: analysis.dominant_frameworks,
          theology_ontology_tensions: analysis.key_tensions,
          theology_ontology_style: analysis.intellectual_style
        };
        break;
      case 2:
        updateData = {
          epistemology_analysis: analysis.epistemology_analysis,
          ethics_analysis: analysis.ethics_analysis,
          epistemology_ethics_frameworks: analysis.dominant_frameworks,
          epistemology_ethics_tensions: analysis.key_tensions,
          epistemology_ethics_style: analysis.intellectual_style
        };
        break;
      case 3:
        updateData = {
          politics_analysis: analysis.politics_analysis,
          aesthetics_analysis: analysis.aesthetics_analysis,
          politics_aesthetics_frameworks: analysis.dominant_frameworks,
          politics_aesthetics_tensions: analysis.key_tensions,
          politics_aesthetics_style: analysis.intellectual_style
        };
        break;
    }

    const { error: updateError } = await supabaseClient
      .from('dna_assessment_results')
      .update(updateData)
      .eq('id', assessment_id);

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
