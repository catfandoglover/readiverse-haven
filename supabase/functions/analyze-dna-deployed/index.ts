import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { getPromptForSection } from "./prompts.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { answers_json, section, assessment_id } = await req.json();
    console.log('Processing analysis for assessment:', assessment_id, 'section:', section);
    if (!answers_json || !section || !assessment_id) {
      console.error('Missing required parameters');
      throw new Error('Missing required parameters');
    }
    const prompt = getPromptForSection(section);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://readiverse-haven.lovable.app/'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing philosophical tendencies and intellectual inclinations based on assessment responses.'
          },
          {
            role: 'user',
            content: `Based on these responses: ${answers_json}\n\n${prompt}`
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${errorText}`);
    }
    const analysisResult = await response.json();
    console.log('Received analysis from OpenRouter');
    // Create Supabase client
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    // First, update the dna_assessment_results with the analysis
    const { error: assessmentError } = await supabaseAdmin.from('dna_assessment_results').update({
      [`section${section}_analysis`]: analysisResult.choices[0].message.content
    }).eq('id', assessment_id);
    if (assessmentError) {
      console.error('Error updating dna_assessment_results:', assessmentError);
      throw new Error(`Error updating assessment: ${assessmentError.message}`);
    }
    // Then, store the detailed analysis in dna_analysis_results
    const { error: analysisError } = await supabaseAdmin.from('dna_analysis_results').insert({
      assessment_id,
      analysis_type: 'section',
      raw_response: analysisResult
    });
    if (analysisError) {
      console.error('Error storing analysis details:', analysisError);
    // Don't throw here as we've already updated the main results
    }
    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult.choices[0].message.content
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in analyze-dna function:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
