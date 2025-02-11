
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
    theology_kindred_spirit_2: null,
    theology_kindred_spirit_3: null,
    theology_kindred_spirit_4: null,
    theology_kindred_spirit_5: null,
    theology_challenging_voice_1: null,
    theology_challenging_voice_2: null,
    theology_challenging_voice_3: null,
    theology_challenging_voice_4: null,
    theology_challenging_voice_5: null,
    ontology_kindred_spirit_1: null,
    ontology_kindred_spirit_2: null,
    ontology_kindred_spirit_3: null,
    ontology_kindred_spirit_4: null,
    ontology_kindred_spirit_5: null,
    ontology_challenging_voice_1: null,
    ontology_challenging_voice_2: null,
    ontology_challenging_voice_3: null,
    ontology_challenging_voice_4: null,
    ontology_challenging_voice_5: null,
    epistemology_kindred_spirit_1: null,
    epistemology_kindred_spirit_2: null,
    epistemology_kindred_spirit_3: null,
    epistemology_kindred_spirit_4: null,
    epistemology_kindred_spirit_5: null,
    epistemology_challenging_voice_1: null,
    epistemology_challenging_voice_2: null,
    epistemology_challenging_voice_3: null,
    epistemology_challenging_voice_4: null,
    epistemology_challenging_voice_5: null,
    ethics_kindred_spirit_1: null,
    ethics_kindred_spirit_2: null,
    ethics_kindred_spirit_3: null,
    ethics_kindred_spirit_4: null,
    ethics_kindred_spirit_5: null,
    ethics_challenging_voice_1: null,
    ethics_challenging_voice_2: null,
    ethics_challenging_voice_3: null,
    ethics_challenging_voice_4: null,
    ethics_challenging_voice_5: null,
    politics_kindred_spirit_1: null,
    politics_kindred_spirit_2: null,
    politics_kindred_spirit_3: null,
    politics_kindred_spirit_4: null,
    politics_kindred_spirit_5: null,
    politics_challenging_voice_1: null,
    politics_challenging_voice_2: null,
    politics_challenging_voice_3: null,
    politics_challenging_voice_4: null,
    politics_challenging_voice_5: null,
    aesthetics_kindred_spirit_1: null,
    aesthetics_kindred_spirit_2: null,
    aesthetics_kindred_spirit_3: null,
    aesthetics_kindred_spirit_4: null,
    aesthetics_kindred_spirit_5: null,
    aesthetics_challenging_voice_1: null,
    aesthetics_challenging_voice_2: null,
    aesthetics_challenging_voice_3: null,
    aesthetics_challenging_voice_4: null,
    aesthetics_challenging_voice_5: null,
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

      // Extract thinkers
      const thinkerAnalysis = parseSection(section1, 'thinker_analysis');
      if (thinkerAnalysis) {
        ['theology', 'ontology'].forEach(domain => {
          for (let i = 1; i <= 5; i++) {
            const kindredTag = `<${domain}_kindred_spirit_${i}>`;
            const kindredEndTag = `</${domain}_kindred_spirit_${i}>`;
            const challengingTag = `<${domain}_challenging_voice_${i}>`;
            const challengingEndTag = `</${domain}_challenging_voice_${i}>`;

            profile[`${domain}_kindred_spirit_${i}`] = extractContent(thinkerAnalysis, kindredTag, kindredEndTag);
            profile[`${domain}_challenging_voice_${i}`] = extractContent(thinkerAnalysis, challengingTag, challengingEndTag);
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
            const kindredTag = `<${domain}_kindred_spirit_${i}>`;
            const kindredEndTag = `</${domain}_kindred_spirit_${i}>`;
            const challengingTag = `<${domain}_challenging_voice_${i}>`;
            const challengingEndTag = `</${domain}_challenging_voice_${i}>`;

            profile[`${domain}_kindred_spirit_${i}`] = extractContent(thinkerAnalysis, kindredTag, kindredEndTag);
            profile[`${domain}_challenging_voice_${i}`] = extractContent(thinkerAnalysis, challengingTag, challengingEndTag);
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
            const kindredTag = `<${domain}_kindred_spirit_${i}>`;
            const kindredEndTag = `</${domain}_kindred_spirit_${i}>`;
            const challengingTag = `<${domain}_challenging_voice_${i}>`;
            const challengingEndTag = `</${domain}_challenging_voice_${i}>`;

            profile[`${domain}_kindred_spirit_${i}`] = extractContent(thinkerAnalysis, kindredTag, kindredEndTag);
            profile[`${domain}_challenging_voice_${i}`] = extractContent(thinkerAnalysis, challengingTag, challengingEndTag);
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
  const basePrompt = `Important: Always write your response in the second person, addressing the subject directly as "you". For example, use phrases like "Your philosophical DNA...", "You tend to...", "Your approach is..."

Here are your answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>`;

  let sectionPrompt = '';
  
  if (section === 1) {
    sectionPrompt = `
### **For Section 1 (Theology & Ontology)**

# **Philosophical Profile Generator Guidelines**

## **Input Required**
Analysis of answers from the philosophical decision trees representing your philosophical DNA.

## **Output Structure Required for this Section**

<philosophical_profile>

<primary_section>
  <archetype>[Domain Archetype]</archetype>
  <archetype_definition>[Brief poetic subtitle capturing your essence]</archetype_definition>
  <introduction>
    [Single paragraph capturing your philosophical essence—focus on how you reconcile contradictions and approach problem-solving]
  </introduction>
</primary_section>

<core_dynamics>
  <key_tension_1>[Key tension in your thinking]</key_tension_1>
  <key_tension_2>[Key tension in your thinking]</key_tension_2>
  <key_tension_3>[Key tension in your thinking]</key_tension_3>
  
  <natural_strength_1>[Your Natural Strength]</natural_strength_1>
  <natural_strength_2>[Your Natural Strength]</natural_strength_2>
  <natural_strength_3>[Your Natural Strength]</natural_strength_3>
  
  <growth_edges_1>[Your Growth Edge]</growth_edges_1>
  <growth_edges_2>[Your Growth Edge]</growth_edges_2>
  <growth_edges_3>[Your Growth Edge]</growth_edges_3>
</core_dynamics>

<domain_analyses>
  <theology_introduction>
    Your approach to theology is...
  </theology_introduction>
  <ontology_introduction>
    Your approach to ontology is...
  </ontology_introduction>
</domain_analyses>

<thinker_analysis>
  <theology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_1>
  <theology_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_2>
  <theology_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_3>
  <theology_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_4>
  <theology_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_5>

  <theology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_1>
  <theology_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_2>
  <theology_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_3>
  <theology_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_4>
  <theology_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_5>

  <ontology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_1>
  <ontology_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_2>
  <ontology_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_3>
  <ontology_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_4>
  <ontology_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_5>

  <ontology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_1>
  <ontology_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_2>
  <ontology_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_3>
  <ontology_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_4>
  <ontology_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_5>
</thinker_analysis>

</philosophical_profile>`;
  } else if (section === 2) {
    sectionPrompt = `
### **For Section 2 (Epistemology & Ethics)**

<philosophical_profile>

<domain_analyses>
  <epistemology_introduction>
    Your approach to epistemology is...
  </epistemology_introduction>
  <ethics_introduction>
    Your approach to ethics is...
  </ethics_introduction>
</domain_analyses>

<thinker_analysis>
  <epistemology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_1>
  <epistemology_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_2>
  <epistemology_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_3>
  <epistemology_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_4>
  <epistemology_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_5>

  <epistemology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_1>
  <epistemology_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_2>
  <epistemology_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_3>
  <epistemology_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_4>
  <epistemology_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_5>

  <ethics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_1>
  <ethics_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_2>
  <ethics_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_3>
  <ethics_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_4>
  <ethics_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_5>

  <ethics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_1>
  <ethics_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_2>
  <ethics_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_3>
  <ethics_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_4>
  <ethics_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_5>
</thinker_analysis>

</philosophical_profile>`;
  } else {
    sectionPrompt = `
### **For Section 3 (Politics & Aesthetics)**

<philosophical_profile>

<domain_analyses>
  <politics_introduction>
    Your approach to politics is...
  </politics_introduction>
  <aesthetics_introduction>
    Your approach to aesthetics is...
  </aesthetics_introduction>
</domain_analyses>

<thinker_analysis>
  <politics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_1>
  <politics_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_2>
  <politics_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_3>
  <politics_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_4>
  <politics_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_5>

  <politics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_1>
  <politics_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_2>
  <politics_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_3>
  <politics_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_4>
  <politics_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_5>

  <aesthetics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_1>
  <aesthetics_kindred_spirit_2>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_2>
  <aesthetics_kindred_spirit_3>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_3>
  <aesthetics_kindred_spirit_4>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_4>
  <aesthetics_kindred_spirit_5>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_5>

  <aesthetics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_1>
  <aesthetics_challenging_voice_2>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_2>
  <aesthetics_challenging_voice_3>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_3>
  <aesthetics_challenging_voice_4>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_4>
  <aesthetics_challenging_voice_5>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_5>
</thinker_analysis>

<concluding_analysis>
<conclusion>[Brief synthesis of your overall philosophical profile, highlighting key themes and potential directions for your development.]</conclusion>
<next_steps>[Practical suggestions on how to refine and evolve your philosophical thinking.]</next_steps>
</concluding_analysis>

</philosophical_profile>`;
  }

  const fullPrompt = `${basePrompt}

${sectionPrompt}

Remember to:
1. Always use second person ("you", "your") throughout the analysis
2. Follow the exact XML structure provided
3. Make the analysis feel personal and directly addressed to the subject
4. Begin each domain analysis with "Your approach to..."
5. Frame all observations in terms of personal philosophical tendencies`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterApiKey}`,
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'DNA Analysis',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-sonnet",
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
  console.log('OpenRouter API response:', JSON.stringify(data, null, 2));

  if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    console.error('Invalid response format from OpenRouter API:', data);
    throw new Error('Invalid response format from OpenRouter API');
  }

  const firstChoice = data.choices[0];
  if (!firstChoice || !firstChoice.message || typeof firstChoice.message.content !== 'string') {
    console.error('Invalid choice format from OpenRouter API:', firstChoice);
    throw new Error('Invalid choice format in OpenRouter API response');
  }

  return firstChoice.message.content;
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
    console.log('Formatted answers_json:', answers_json);

    // Generate all three sections sequentially
    console.log('Generating section 1...');
    const section1 = await generateAnalysis(answers_json, 1);
    console.log('Generating section 2...');
    const section2 = await generateAnalysis(answers_json, 2);
    console.log('Generating section 3...');
    const section3 = await generateAnalysis(answers_json, 3);

    // Parse the responses
    console.log('Parsing analysis...');
    const parsedProfile = parsePhilosophicalProfile(section1, section2, section3);
    console.log('Parsed profile:', parsedProfile);

    // Store the analysis in Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .insert({
        assessment_id: assessmentId,
        analysis_type: 'CLAUDE',
        analysis_text: { section1, section2, section3 },
        raw_response: {
          section1,
          section2,
          section3
        },
        ...parsedProfile
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
