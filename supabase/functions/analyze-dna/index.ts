import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getPromptForSection } from './prompts.ts';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractContent(text: string, startTag: string, endTag: string): string | null {
  const startIndex = text.indexOf(startTag);
  if (startIndex === -1) return null;
  
  const endIndex = text.indexOf(endTag, startIndex + startTag.length);
  if (endIndex === -1) return null;
  
  return text.substring(startIndex + startTag.length, endIndex).trim();
}

function parseSection(text: string, tag: string): string | null {
  return extractContent(text, `<${tag}>`, `</${tag}>`);
}

function parsePhilosophicalProfile(section1: string, section2: string, section3: string) {
  const profile: Record<string, string | null> = {
    archetype: null,
    archetype_definition: null,
    introduction: null,
    key_tension_1: null,
    key_tension_2: null,
    key_tension_3: null,
    natural_strength_1: null,
    natural_strength_2: null,
    natural_strength_3: null,
    growth_edges_1: null,
    growth_edges_2: null,
    growth_edges_3: null,
    theology_introduction: null,
    ontology_introduction: null,
    epistemology_introduction: null,
    ethics_introduction: null,
    politics_introduction: null,
    aesthetics_introduction: null,
    theology_kindred_spirit_1: null,
    theology_kindred_spirit_1_classic: null,
    theology_kindred_spirit_1_rationale: null,
    theology_kindred_spirit_2: null,
    theology_kindred_spirit_2_classic: null,
    theology_kindred_spirit_2_rationale: null,
    theology_kindred_spirit_3: null,
    theology_kindred_spirit_3_classic: null,
    theology_kindred_spirit_3_rationale: null,
    theology_kindred_spirit_4: null,
    theology_kindred_spirit_4_classic: null,
    theology_kindred_spirit_4_rationale: null,
    theology_kindred_spirit_5: null,
    theology_kindred_spirit_5_classic: null,
    theology_kindred_spirit_5_rationale: null,
    theology_challenging_voice_1: null,
    theology_challenging_voice_1_classic: null,
    theology_challenging_voice_1_rationale: null,
    theology_challenging_voice_2: null,
    theology_challenging_voice_2_classic: null,
    theology_challenging_voice_2_rationale: null,
    theology_challenging_voice_3: null,
    theology_challenging_voice_3_classic: null,
    theology_challenging_voice_3_rationale: null,
    theology_challenging_voice_4: null,
    theology_challenging_voice_4_classic: null,
    theology_challenging_voice_4_rationale: null,
    theology_challenging_voice_5: null,
    theology_challenging_voice_5_classic: null,
    theology_challenging_voice_5_rationale: null,
    ontology_kindred_spirit_1: null,
    ontology_kindred_spirit_1_classic: null,
    ontology_kindred_spirit_1_rationale: null,
    ontology_kindred_spirit_2: null,
    ontology_kindred_spirit_2_classic: null,
    ontology_kindred_spirit_2_rationale: null,
    ontology_kindred_spirit_3: null,
    ontology_kindred_spirit_3_classic: null,
    ontology_kindred_spirit_3_rationale: null,
    ontology_kindred_spirit_4: null,
    ontology_kindred_spirit_4_classic: null,
    ontology_kindred_spirit_4_rationale: null,
    ontology_kindred_spirit_5: null,
    ontology_kindred_spirit_5_classic: null,
    ontology_kindred_spirit_5_rationale: null,
    ontology_challenging_voice_1: null,
    ontology_challenging_voice_1_classic: null,
    ontology_challenging_voice_1_rationale: null,
    ontology_challenging_voice_2: null,
    ontology_challenging_voice_2_classic: null,
    ontology_challenging_voice_2_rationale: null,
    ontology_challenging_voice_3: null,
    ontology_challenging_voice_3_classic: null,
    ontology_challenging_voice_3_rationale: null,
    ontology_challenging_voice_4: null,
    ontology_challenging_voice_4_classic: null,
    ontology_challenging_voice_4_rationale: null,
    ontology_challenging_voice_5: null,
    ontology_challenging_voice_5_classic: null,
    ontology_challenging_voice_5_rationale: null,
    epistemology_kindred_spirit_1: null,
    epistemology_kindred_spirit_1_classic: null,
    epistemology_kindred_spirit_1_rationale: null,
    epistemology_kindred_spirit_2: null,
    epistemology_kindred_spirit_2_classic: null,
    epistemology_kindred_spirit_2_rationale: null,
    epistemology_kindred_spirit_3: null,
    epistemology_kindred_spirit_3_classic: null,
    epistemology_kindred_spirit_3_rationale: null,
    epistemology_kindred_spirit_4: null,
    epistemology_kindred_spirit_4_classic: null,
    epistemology_kindred_spirit_4_rationale: null,
    epistemology_kindred_spirit_5: null,
    epistemology_kindred_spirit_5_classic: null,
    epistemology_kindred_spirit_5_rationale: null,
    epistemology_challenging_voice_1: null,
    epistemology_challenging_voice_1_classic: null,
    epistemology_challenging_voice_1_rationale: null,
    epistemology_challenging_voice_2: null,
    epistemology_challenging_voice_2_classic: null,
    epistemology_challenging_voice_2_rationale: null,
    epistemology_challenging_voice_3: null,
    epistemology_challenging_voice_3_classic: null,
    epistemology_challenging_voice_3_rationale: null,
    epistemology_challenging_voice_4: null,
    epistemology_challenging_voice_4_classic: null,
    epistemology_challenging_voice_4_rationale: null,
    epistemology_challenging_voice_5: null,
    epistemology_challenging_voice_5_classic: null,
    epistemology_challenging_voice_5_rationale: null,
    ethics_kindred_spirit_1: null,
    ethics_kindred_spirit_1_classic: null,
    ethics_kindred_spirit_1_rationale: null,
    ethics_kindred_spirit_2: null,
    ethics_kindred_spirit_2_classic: null,
    ethics_kindred_spirit_2_rationale: null,
    ethics_kindred_spirit_3: null,
    ethics_kindred_spirit_3_classic: null,
    ethics_kindred_spirit_3_rationale: null,
    ethics_kindred_spirit_4: null,
    ethics_kindred_spirit_4_classic: null,
    ethics_kindred_spirit_4_rationale: null,
    ethics_kindred_spirit_5: null,
    ethics_kindred_spirit_5_classic: null,
    ethics_kindred_spirit_5_rationale: null,
    ethics_challenging_voice_1: null,
    ethics_challenging_voice_1_classic: null,
    ethics_challenging_voice_1_rationale: null,
    ethics_challenging_voice_2: null,
    ethics_challenging_voice_2_classic: null,
    ethics_challenging_voice_2_rationale: null,
    ethics_challenging_voice_3: null,
    ethics_challenging_voice_3_classic: null,
    ethics_challenging_voice_3_rationale: null,
    ethics_challenging_voice_4: null,
    ethics_challenging_voice_4_classic: null,
    ethics_challenging_voice_4_rationale: null,
    ethics_challenging_voice_5: null,
    ethics_challenging_voice_5_classic: null,
    ethics_challenging_voice_5_rationale: null,
    politics_kindred_spirit_1: null,
    politics_kindred_spirit_1_classic: null,
    politics_kindred_spirit_1_rationale: null,
    politics_kindred_spirit_2: null,
    politics_kindred_spirit_2_classic: null,
    politics_kindred_spirit_2_rationale: null,
    politics_kindred_spirit_3: null,
    politics_kindred_spirit_3_classic: null,
    politics_kindred_spirit_3_rationale: null,
    politics_kindred_spirit_4: null,
    politics_kindred_spirit_4_classic: null,
    politics_kindred_spirit_4_rationale: null,
    politics_kindred_spirit_5: null,
    politics_kindred_spirit_5_classic: null,
    politics_kindred_spirit_5_rationale: null,
    politics_challenging_voice_1: null,
    politics_challenging_voice_1_classic: null,
    politics_challenging_voice_1_rationale: null,
    politics_challenging_voice_2: null,
    politics_challenging_voice_2_classic: null,
    politics_challenging_voice_2_rationale: null,
    politics_challenging_voice_3: null,
    politics_challenging_voice_3_classic: null,
    politics_challenging_voice_3_rationale: null,
    politics_challenging_voice_4: null,
    politics_challenging_voice_4_classic: null,
    politics_challenging_voice_4_rationale: null,
    politics_challenging_voice_5: null,
    politics_challenging_voice_5_classic: null,
    politics_challenging_voice_5_rationale: null,
    aesthetics_kindred_spirit_1: null,
    aesthetics_kindred_spirit_1_classic: null,
    aesthetics_kindred_spirit_1_rationale: null,
    aesthetics_kindred_spirit_2: null,
    aesthetics_kindred_spirit_2_classic: null,
    aesthetics_kindred_spirit_2_rationale: null,
    aesthetics_kindred_spirit_3: null,
    aesthetics_kindred_spirit_3_classic: null,
    aesthetics_kindred_spirit_3_rationale: null,
    aesthetics_kindred_spirit_4: null,
    aesthetics_kindred_spirit_4_classic: null,
    aesthetics_kindred_spirit_4_rationale: null,
    aesthetics_kindred_spirit_5: null,
    aesthetics_kindred_spirit_5_classic: null,
    aesthetics_kindred_spirit_5_rationale: null,
    aesthetics_challenging_voice_1: null,
    aesthetics_challenging_voice_1_classic: null,
    aesthetics_challenging_voice_1_rationale: null,
    aesthetics_challenging_voice_2: null,
    aesthetics_challenging_voice_2_classic: null,
    aesthetics_challenging_voice_2_rationale: null,
    aesthetics_challenging_voice_3: null,
    aesthetics_challenging_voice_3_classic: null,
    aesthetics_challenging_voice_3_rationale: null,
    aesthetics_challenging_voice_4: null,
    aesthetics_challenging_voice_4_classic: null,
    aesthetics_challenging_voice_4_rationale: null,
    aesthetics_challenging_voice_5: null,
    aesthetics_challenging_voice_5_classic: null,
    aesthetics_challenging_voice_5_rationale: null,
    conclusion: null,
    next_steps: null
  };

  try {
    // Parse section 1 - Primary information and Theology/Ontology
    if (section1) {
      // Extract from primary_section
      const primarySection = parseSection(section1, 'primary_section');
      if (primarySection) {
        profile.archetype = extractContent(primarySection, '<archetype>', '</archetype>');
        profile.archetype_definition = extractContent(primarySection, '<archetype_definition>', '</archetype_definition>');
        profile.introduction = extractContent(primarySection, '<introduction>', '</introduction>');
      }

      // Extract core dynamics
      const coreDynamics = parseSection(section1, 'core_dynamics');
      if (coreDynamics) {
        profile.key_tension_1 = extractContent(coreDynamics, '<key_tension_1>', '</key_tension_1>');
        profile.key_tension_2 = extractContent(coreDynamics, '<key_tension_2>', '</key_tension_2>');
        profile.key_tension_3 = extractContent(coreDynamics, '<key_tension_3>', '</key_tension_3>');
        profile.natural_strength_1 = extractContent(coreDynamics, '<natural_strength_1>', '</natural_strength_1>');
        profile.natural_strength_2 = extractContent(coreDynamics, '<natural_strength_2>', '</natural_strength_2>');
        profile.natural_strength_3 = extractContent(coreDynamics, '<natural_strength_3>', '</natural_strength_3>');
        profile.growth_edges_1 = extractContent(coreDynamics, '<growth_edges_1>', '</growth_edges_1>');
        profile.growth_edges_2 = extractContent(coreDynamics, '<growth_edges_2>', '</growth_edges_2>');
        profile.growth_edges_3 = extractContent(coreDynamics, '<growth_edges_3>', '</growth_edges_3>');
      }

      // Extract domain introductions
      const domainAnalyses = parseSection(section1, 'domain_analyses');
      if (domainAnalyses) {
        profile.theology_introduction = extractContent(domainAnalyses, '<theology_introduction>', '</theology_introduction>');
        profile.ontology_introduction = extractContent(domainAnalyses, '<ontology_introduction>', '</ontology_introduction>');
      }

      // Extract thinkers with new structure
      const thinkerAnalysis = parseSection(section1, 'thinker_analysis');
      if (thinkerAnalysis) {
        ['theology', 'ontology'].forEach(domain => {
          for (let i = 1; i <= 5; i++) {
            // Kindred spirits
            const kindredBase = `${domain}_kindred_spirit_${i}`;
            profile[kindredBase] = extractContent(thinkerAnalysis, `<${kindredBase}>`, `</${kindredBase}>`);
            profile[`${kindredBase}_classic`] = extractContent(thinkerAnalysis, `<${kindredBase}_classic>`, `</${kindredBase}_classic>`);
            profile[`${kindredBase}_rationale`] = extractContent(thinkerAnalysis, `<${kindredBase}_rationale>`, `</${kindredBase}_rationale>`);

            // Challenging voices
            const challengingBase = `${domain}_challenging_voice_${i}`;
            profile[challengingBase] = extractContent(thinkerAnalysis, `<${challengingBase}>`, `</${challengingBase}>`);
            profile[`${challengingBase}_classic`] = extractContent(thinkerAnalysis, `<${challengingBase}_classic>`, `</${challengingBase}_classic>`);
            profile[`${challengingBase}_rationale`] = extractContent(thinkerAnalysis, `<${challengingBase}_rationale>`, `</${challengingBase}_rationale>`);
          }
        });
      }
    }

    // Parse section 2 - Epistemology and Ethics
    if (section2) {
      const domainAnalyses = parseSection(section2, 'domain_analyses');
      if (domainAnalyses) {
        profile.epistemology_introduction = extractContent(domainAnalyses, '<epistemology_introduction>', '</epistemology_introduction>');
        profile.ethics_introduction = extractContent(domainAnalyses, '<ethics_introduction>', '</ethics_introduction>');
      }

      const thinkerAnalysis = parseSection(section2, 'thinker_analysis');
      if (thinkerAnalysis) {
        ['epistemology', 'ethics'].forEach(domain => {
          for (let i = 1; i <= 5; i++) {
            // Kindred spirits
            const kindredBase = `${domain}_kindred_spirit_${i}`;
            profile[kindredBase] = extractContent(thinkerAnalysis, `<${kindredBase}>`, `</${kindredBase}>`);
            profile[`${kindredBase}_classic`] = extractContent(thinkerAnalysis, `<${kindredBase}_classic>`, `</${kindredBase}_classic>`);
            profile[`${kindredBase}_rationale`] = extractContent(thinkerAnalysis, `<${kindredBase}_rationale>`, `</${kindredBase}_rationale>`);

            // Challenging voices
            const challengingBase = `${domain}_challenging_voice_${i}`;
            profile[challengingBase] = extractContent(thinkerAnalysis, `<${challengingBase}>`, `</${challengingBase}>`);
            profile[`${challengingBase}_classic`] = extractContent(thinkerAnalysis, `<${challengingBase}_classic>`, `</${challengingBase}_classic>`);
            profile[`${challengingBase}_rationale`] = extractContent(thinkerAnalysis, `<${challengingBase}_rationale>`, `</${challengingBase}_rationale>`);
          }
        });
      }
    }

    // Parse section 3 - Politics and Aesthetics + Conclusion
    if (section3) {
      const domainAnalyses = parseSection(section3, 'domain_analyses');
      if (domainAnalyses) {
        profile.politics_introduction = extractContent(domainAnalyses, '<politics_introduction>', '</politics_introduction>');
        profile.aesthetics_introduction = extractContent(domainAnalyses, '<aesthetics_introduction>', '</aesthetics_introduction>');
      }

      const thinkerAnalysis = parseSection(section3, 'thinker_analysis');
      if (thinkerAnalysis) {
        ['politics', 'aesthetics'].forEach(domain => {
          for (let i = 1; i <= 5; i++) {
            // Kindred spirits
            const kindredBase = `${domain}_kindred_spirit_${i}`;
            profile[kindredBase] = extractContent(thinkerAnalysis, `<${kindredBase}>`, `</${kindredBase}>`);
            profile[`${kindredBase}_classic`] = extractContent(thinkerAnalysis, `<${kindredBase}_classic>`, `</${kindredBase}_classic>`);
            profile[`${kindredBase}_rationale`] = extractContent(thinkerAnalysis, `<${kindredBase}_rationale>`, `</${kindredBase}_rationale>`);

            // Challenging voices
            const challengingBase = `${domain}_challenging_voice_${i}`;
            profile[challengingBase] = extractContent(thinkerAnalysis, `<${challengingBase}>`, `</${challengingBase}>`);
            profile[`${challengingBase}_classic`] = extractContent(thinkerAnalysis, `<${challengingBase}_classic>`, `</${challengingBase}_classic>`);
            profile[`${challengingBase}_rationale`] = extractContent(thinkerAnalysis, `<${challengingBase}_rationale>`, `</${challengingBase}_rationale>`);
          }
        });
      }

      const concludingAnalysis = parseSection(section3, 'concluding_analysis');
      if (concludingAnalysis) {
        profile.conclusion = extractContent(concludingAnalysis, '<conclusion>', '</conclusion>');
        profile.next_steps = extractContent(concludingAnalysis, '<next_steps>', '</next_steps>');
      }
    }

    return profile;
  } catch (error) {
    console.error('Error parsing philosophical profile:', error);
    throw new Error(`Failed to parse philosophical profile: ${error.message}`);
  }
}

async function generateAnalysis(answers_json: string, section: number): Promise<string> {
  const prompt = getPromptForSection(section, answers_json);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable.dev'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical profiler who analyzes philosophical tendencies and provides insights in the second person ("you"). Always structure your response exactly according to the XML template provided, filling in each section thoughtfully while maintaining the tags.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { answers_json, section, assessment_id } = await req.json();
      
      if (!answers_json || !section || !assessment_id) {
        throw new Error('Missing required fields: answers_json, section, and assessment_id are required');
      }

      // Generate analysis text
      const analysis = await generateAnalysis(answers_json, section);
      
      // Store analysis in the database with correct enum values
      const { error: storeError } = await supabase.from('dna_analysis_results').insert({
        assessment_id: assessment_id,
        analysis_text: analysis,
        analysis_type: section === 1 ? 'section_1' : 
                      section === 2 ? 'section_2' : 'section_3'
      });

      if (storeError) {
        console.error('Error storing analysis:', storeError);
        throw storeError;
      }
      
      return new Response(
        JSON.stringify({ analysis }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
