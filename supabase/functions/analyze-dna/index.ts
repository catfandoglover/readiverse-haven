
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

interface ExtractedData {
  name: string;
  mythopoetic_title: string;
  introduction: string;
  kt_1: string;
  kt_2: string;
  kt_3: string;
  ns_1: string;
  ns_2: string;
  ns_3: string;
  ge_1: string;
  ge_2: string;
  ge_3: string;
  bwya: string;
  theology_intro: string;
  [key: string]: string;
}

function extractDataFromAnalysis(analysisText: string): ExtractedData {
  console.log('Starting data extraction from analysis');
  
  const data: ExtractedData = {
    name: '',
    mythopoetic_title: '',
    introduction: '',
    kt_1: '',
    kt_2: '',
    kt_3: '',
    ns_1: '',
    ns_2: '',
    ns_3: '',
    ge_1: '',
    ge_2: '',
    ge_3: '',
    bwya: '',
    theology_intro: '',
  };

  // Regular expressions for extracting data
  const sections = analysisText.split(/\n{2,}/);
  
  for (const section of sections) {
    // Extract name and mythopoetic title
    if (section.includes('[') && section.includes(']')) {
      const parts = section.split(/[\[\]]/);
      if (parts.length >= 2) {
        data.name = parts[0].trim();
        data.mythopoetic_title = parts[1].trim();
      }
    }

    // Extract introduction
    if (section.startsWith('Your intellectual DNA')) {
      data.introduction = section.trim();
    }

    // Extract Key Tensions
    if (section.includes('Key Tensions')) {
      const tensions = section.match(/- ([^\n]+)/g);
      if (tensions) {
        data.kt_1 = tensions[0]?.replace('- ', '') || '';
        data.kt_2 = tensions[1]?.replace('- ', '') || '';
        data.kt_3 = tensions[2]?.replace('- ', '') || '';
      }
    }

    // Extract Natural Strengths
    if (section.includes('Natural Strengths')) {
      const strengths = section.match(/- ([^\n]+)/g);
      if (strengths) {
        data.ns_1 = strengths[0]?.replace('- ', '') || '';
        data.ns_2 = strengths[1]?.replace('- ', '') || '';
        data.ns_3 = strengths[2]?.replace('- ', '') || '';
      }
    }

    // Extract Growth Edges
    if (section.includes('Growth Edges')) {
      const edges = section.match(/- ([^\n]+)/g);
      if (edges) {
        data.ge_1 = edges[0]?.replace('- ', '') || '';
        data.ge_2 = edges[1]?.replace('- ', '') || '';
        data.ge_3 = edges[2]?.replace('- ', '') || '';
      }
    }

    // Extract "But who you are"
    if (section.includes('But who you are')) {
      data.bwya = section.trim();
    }

    // Process domain intros and thinkers
    const domains = ['theology', 'ontology', 'epistemology', 'ethics', 'politics', 'aesthetics'];
    for (const domain of domains) {
      // Extract domain intro
      if (section.toLowerCase().includes(domain) && !section.includes('Kindred') && !section.includes('Challenging')) {
        data[`${domain}_intro`] = section.trim();
      }

      // Extract Kindred Spirits
      if (section.includes(`${domain.charAt(0).toUpperCase() + domain.slice(1)} Kindred Spirits`)) {
        const thinkers = section.match(/- ([^\n]+)/g);
        if (thinkers) {
          thinkers.forEach((thinker, index) => {
            const match = thinker.match(/- (.+?), (.+?) - (.+)/);
            if (match && index < 5) {
              data[`${domain}_ks_${index + 1}_name`] = match[1].trim();
              data[`${domain}_ks_${index + 1}_classic`] = match[2].trim();
              data[`${domain}_ks_${index + 1}_reason`] = match[3].trim();
            }
          });
        }
      }

      // Extract Challenging Voices
      if (section.includes(`${domain.charAt(0).toUpperCase() + domain.slice(1)} Challenging Voices`)) {
        const voices = section.match(/- ([^\n]+)/g);
        if (voices) {
          voices.forEach((voice, index) => {
            const match = voice.match(/- (.+?), (.+?) - (.+)/);
            if (match && index < 5) {
              data[`${domain}_cv_${index + 1}_name`] = match[1].trim();
              data[`${domain}_cv_${index + 1}_classic`] = match[2].trim();
              data[`${domain}_cv_${index + 1}_reason`] = match[3].trim();
            }
          });
        }
      }
    }

    // Extract conclusion
    if (section.includes('Concluding Analysis')) {
      data.conclusion = section.replace('Concluding Analysis', '').trim();
    }
  }

  console.log('Data extraction completed');
  return data;
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

    // Format answers_json for the prompt
    const answers_json = JSON.stringify({ name: userName, answers }, null, 2);

    // Generate analysis using Claude
    console.log('Generating analysis using Claude...');
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
            content: `Based on the following answers, analyze this person's philosophical DNA and provide a detailed profile. Format your response to be easily parsed, using clear section headers and consistent formatting for each section.

${answers_json}

Include the following sections:
1. Name [Mythopoetic Title]
2. Introduction paragraph
3. Key Tensions (3 bullet points)
4. Natural Strengths (3 bullet points)
5. Growth Edges (3 bullet points)
6. "But who you are" paragraph
7. For each domain (Theology, Ontology, Epistemology, Ethics, Politics, Aesthetics):
   - Domain introduction
   - Kindred Spirits (5 entries formatted as "Name, Work - Reason")
   - Challenging Voices (5 entries formatted as "Name, Work - Reason")
8. Concluding Analysis

Use consistent formatting and clear section headers to make the response easy to parse.`
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
    const analysisText = data.choices[0].message.content;
    
    // Extract structured data from the analysis
    const extractedData = extractDataFromAnalysis(analysisText);
    
    // Store the extracted data in Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert([{
        assessment_id: assessmentId,
        analysis_type: 'CLAUDE',
        ...extractedData
      }])
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
