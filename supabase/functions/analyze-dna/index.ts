
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateDNAAnalysis } from "./prompts.ts";

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

    console.log('Starting DNA analysis for:', {
      assessment_id,
      section,
      answers: answers_json
    });

    if (!answers_json || !section || !assessment_id) {
      console.error('Missing required parameters:', { answers_json, section, assessment_id });
      throw new Error('Missing required parameters');
    }

    // Parse the answers JSON
    let answers;
    try {
      answers = JSON.parse(answers_json);
    } catch (e) {
      console.error('Error parsing answers JSON:', e);
      throw new Error('Invalid answers JSON format');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      throw new Error('Server configuration error');
    }

    // Generate the analysis
    const analysis = await generateDNAAnalysis(answers, section);
    console.log('Generated analysis:', analysis);

    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    // Update the assessment with the analysis results
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/dna_assessment_results?id=eq.${assessment_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        analysis_section_${section}: analysis
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Error updating assessment:', errorText);
      throw new Error(`Failed to update assessment: ${errorText}`);
    }

    console.log('Successfully updated assessment:', assessment_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in analyze-dna function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
