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

function findNestedContent(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>\\s*([\\s\\S]*?)\\s*</${tag}>`, 'si');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function findAllInstancesContent(text: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>\\s*([\\s\\S]*?)\\s*</${tag}>`, 'sig');
  const matches = text.matchAll(regex);
  return Array.from(matches).map(match => match[1].trim());
}

function parsePhilosophicalProfile(text: string): Record<string, string> {
  const profile: Record<string, string> = {};
  
  const sections = findAllInstancesContent(text, 'philosophical_profile');
  console.log('Found sections:', sections.length);
  
  sections.forEach((section, index) => {
    console.log(`Processing section ${index + 1}`);
    
    const primarySection = findNestedContent(section, 'primary_section');
    if (primarySection) {
      profile.archetype = profile.archetype || findNestedContent(primarySection, 'archetype') || '';
      profile.archetype_definition = profile.archetype_definition || findNestedContent(primarySection, 'archetype_definition') || '';
      profile.introduction = profile.introduction || findNestedContent(primarySection, 'introduction') || '';
    }

    const coreDynamics = findNestedContent(section, 'core_dynamics');
    if (coreDynamics) {
      profile.key_tension_1 = profile.key_tension_1 || findNestedContent(coreDynamics, 'key_tension_1') || '';
      profile.key_tension_2 = profile.key_tension_2 || findNestedContent(coreDynamics, 'key_tension_2') || '';
      profile.key_tension_3 = profile.key_tension_3 || findNestedContent(coreDynamics, 'key_tension_3') || '';
      profile.natural_strength_1 = profile.natural_strength_1 || findNestedContent(coreDynamics, 'natural_strength_1') || '';
      profile.natural_strength_2 = profile.natural_strength_2 || findNestedContent(coreDynamics, 'natural_strength_2') || '';
      profile.natural_strength_3 = profile.natural_strength_3 || findNestedContent(coreDynamics, 'natural_strength_3') || '';
      profile.growth_edges_1 = profile.growth_edges_1 || findNestedContent(coreDynamics, 'growth_edges_1') || '';
      profile.growth_edges_2 = profile.growth_edges_2 || findNestedContent(coreDynamics, 'growth_edges_2') || '';
      profile.growth_edges_3 = profile.growth_edges_3 || findNestedContent(coreDynamics, 'growth_edges_3') || '';
    }

    const domainAnalyses = findNestedContent(section, 'domain_analyses');
    if (domainAnalyses) {
      profile.theology_introduction = profile.theology_introduction || findNestedContent(domainAnalyses, 'theology_introduction') || '';
      profile.ontology_introduction = profile.ontology_introduction || findNestedContent(domainAnalyses, 'ontology_introduction') || '';
      profile.epistemology_introduction = profile.epistemology_introduction || findNestedContent(domainAnalyses, 'epistemology_introduction') || '';
      profile.ethics_introduction = profile.ethics_introduction || findNestedContent(domainAnalyses, 'ethics_introduction') || '';
      profile.politics_introduction = profile.politics_introduction || findNestedContent(domainAnalyses, 'politics_introduction') || '';
      profile.aesthetics_introduction = profile.aesthetics_introduction || findNestedContent(domainAnalyses, 'aesthetics_introduction') || '';
    }

    const thinkerAnalysis = findNestedContent(section, 'thinker_analysis');
    if (thinkerAnalysis) {
      ['theology', 'ontology', 'epistemology', 'ethics', 'politics', 'aesthetics'].forEach(domain => {
        for (let i = 1; i <= 5; i++) {
          const ksBase = `${domain}_kindred_spirit_${i}`;
          profile[ksBase] = profile[ksBase] || findNestedContent(thinkerAnalysis, ksBase) || '';
          profile[`${ksBase}_classic`] = profile[`${ksBase}_classic`] || findNestedContent(thinkerAnalysis, `${ksBase}_classic`) || '';
          profile[`${ksBase}_rationale`] = profile[`${ksBase}_rationale`] || findNestedContent(thinkerAnalysis, `${ksBase}_rationale`) || '';

          const cvBase = `${domain}_challenging_voice_${i}`;
          profile[cvBase] = profile[cvBase] || findNestedContent(thinkerAnalysis, cvBase) || '';
          profile[`${cvBase}_classic`] = profile[`${cvBase}_classic`] || findNestedContent(thinkerAnalysis, `${cvBase}_classic`) || '';
          profile[`${cvBase}_rationale`] = profile[`${cvBase}_rationale`] || findNestedContent(thinkerAnalysis, `${cvBase}_rationale`) || '';
        }
      });
    }

    const concludingAnalysis = findNestedContent(section, 'concluding_analysis');
    if (concludingAnalysis) {
      profile.conclusion = profile.conclusion || findNestedContent(concludingAnalysis, 'conclusion') || '';
      profile.next_steps = profile.next_steps || findNestedContent(concludingAnalysis, 'next_steps') || '';
    }
  });

  const populatedFields = Object.entries(profile)
    .filter(([_, value]) => value && value.length > 0)
    .map(([key]) => key);
  
  console.log('Populated fields:', populatedFields);
  console.log('Total fields populated:', populatedFields.length);
  console.log('Fields with content:', Object.keys(profile).filter(key => profile[key]));
  
  return profile;
}

async function generateAnalysis(answers_json: string, section: number): Promise<{ content: string, raw_response: any }> {
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
        model: 'anthropic/claude-3.5-sonnet',
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
    
    // Validate the response structure
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    console.log('Raw AI response for section', section, ':', data.choices[0].message.content);
    return {
      content: data.choices[0].message.content,
      raw_response: data
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
}

async function generateCompleteAnalysis(answers_json: string): Promise<{ analysis: string, raw_responses: any[], parsed_content: Record<string, string> }> {
  try {
    const section1 = await generateAnalysis(answers_json, 1);
    const section2 = await generateAnalysis(answers_json, 2);
    const section3 = await generateAnalysis(answers_json, 3);
    
    const combinedContent = `<philosophical_profile>
      ${section1.content}
      ${section2.content}
      ${section3.content}
    </philosophical_profile>`;
    
    console.log('Combined content before parsing:', combinedContent);
    const parsedContent = parsePhilosophicalProfile(combinedContent);
    
    return {
      analysis: combinedContent,
      raw_responses: [section1.raw_response, section2.raw_response, section3.raw_response],
      parsed_content: parsedContent
    };
  } catch (error) {
    console.error('Error in generateCompleteAnalysis:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { answers_json, assessment_id } = await req.json();
      
      if (!answers_json || !assessment_id) {
        throw new Error('Missing required fields: answers_json and assessment_id are required');
      }

      const { analysis, raw_responses, parsed_content } = await generateCompleteAnalysis(answers_json);
      
      console.log('Database insert data:', {
        assessment_id,
        raw_response: raw_responses,
        archetype: parsed_content.archetype,
        introduction: parsed_content.introduction,
        archetype_definition: parsed_content.archetype_definition,
        key_tension_1: parsed_content.key_tension_1,
        key_tension_2: parsed_content.key_tension_2,
        key_tension_3: parsed_content.key_tension_3,
        natural_strength_1: parsed_content.natural_strength_1,
        natural_strength_2: parsed_content.natural_strength_2,
        natural_strength_3: parsed_content.natural_strength_3,
        growth_edges_1: parsed_content.growth_edges_1,
        growth_edges_2: parsed_content.growth_edges_2,
        growth_edges_3: parsed_content.growth_edges_3,
        conclusion: parsed_content.conclusion,
        next_steps: parsed_content.next_steps,
        
        theology_introduction: parsed_content.theology_introduction,
        ontology_introduction: parsed_content.ontology_introduction,
        epistemology_introduction: parsed_content.epistemology_introduction,
        ethics_introduction: parsed_content.ethics_introduction,
        politics_introduction: parsed_content.politics_introduction,
        aesthetics_introduction: parsed_content.aesthetics_introduction,
        
        ...Object.entries(parsed_content).reduce((acc, [key, value]) => {
          if (key.match(/(theology|ontology|epistemology|ethics|politics|aesthetics)_(kindred_spirit|challenging_voice)_[1-5](_classic|_rationale)?$/)) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const { error: storeError } = await supabase.from('dna_analysis_results').insert({
        assessment_id: assessment_id,
        analysis_text: analysis,
        analysis_type: 'section_1',
        raw_response: raw_responses,
        archetype: parsed_content.archetype,
        introduction: parsed_content.introduction,
        archetype_definition: parsed_content.archetype_definition,
        key_tension_1: parsed_content.key_tension_1,
        key_tension_2: parsed_content.key_tension_2,
        key_tension_3: parsed_content.key_tension_3,
        natural_strength_1: parsed_content.natural_strength_1,
        natural_strength_2: parsed_content.natural_strength_2,
        natural_strength_3: parsed_content.natural_strength_3,
        growth_edges_1: parsed_content.growth_edges_1,
        growth_edges_2: parsed_content.growth_edges_2,
        growth_edges_3: parsed_content.growth_edges_3,
        conclusion: parsed_content.conclusion,
        next_steps: parsed_content.next_steps,
        
        theology_introduction: parsed_content.theology_introduction,
        ontology_introduction: parsed_content.ontology_introduction,
        epistemology_introduction: parsed_content.epistemology_introduction,
        ethics_introduction: parsed_content.ethics_introduction,
        politics_introduction: parsed_content.politics_introduction,
        aesthetics_introduction: parsed_content.aesthetics_introduction,
        
        ...Object.entries(parsed_content).reduce((acc, [key, value]) => {
          if (key.match(/(theology|ontology|epistemology|ethics|politics|aesthetics)_(kindred_spirit|challenging_voice)_[1-5](_classic|_rationale)?$/)) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>)
      });

      if (storeError) {
        console.error('Error storing analysis:', storeError);
        throw storeError;
      }
      
      return new Response(
        JSON.stringify({ analysis, parsed_content }),
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
