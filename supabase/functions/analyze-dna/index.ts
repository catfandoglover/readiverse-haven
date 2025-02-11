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

function parsePhilosophicalProfile(analysisText: string) {
  const profile: Record<string, string | null> = {
    archetype: null,
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
    conclusion: null,
    next_steps: null,
  };

  // Extract archetype and introduction
  const primarySection = parseSection(analysisText, 'primary_section') || 
                        parseSection(analysisText, 'primary');
  if (primarySection) {
    profile.archetype = extractContent(primarySection, '<archetype>', '</archetype>');
    profile.archetype_definition = extractContent(primarySection, '<subtitle>', '</subtitle>');
    profile.introduction = extractContent(primarySection, '<essence>', '</essence>') ||
                          primarySection.split('\n').slice(2).join('\n').trim();
  }

  // Extract core dynamics
  const coreDynamics = parseSection(analysisText, 'core_dynamics');
  if (coreDynamics) {
    const keyTensions = coreDynamics.split('- ').filter(s => s.trim());
    const strengthsStart = coreDynamics.indexOf('natural_strengths>') !== -1 ? 
      coreDynamics.indexOf('natural_strengths>') : 
      coreDynamics.indexOf('Natural Strengths');
    const growthEdgesStart = coreDynamics.indexOf('growth_edges>') !== -1 ?
      coreDynamics.indexOf('growth_edges>') :
      coreDynamics.indexOf('Growth Edges');

    if (strengthsStart !== -1 && growthEdgesStart !== -1) {
      const tensionsSection = coreDynamics.substring(0, strengthsStart).split('- ').filter(s => s.trim());
      const strengthsSection = coreDynamics.substring(strengthsStart, growthEdgesStart).split('- ').filter(s => s.trim());
      const growthSection = coreDynamics.substring(growthEdgesStart).split('- ').filter(s => s.trim());

      tensionsSection.slice(1, 4).forEach((tension, i) => {
        profile[`key_tension_${i + 1}`] = tension.trim();
      });

      strengthsSection.slice(1, 4).forEach((strength, i) => {
        profile[`natural_strength_${i + 1}`] = strength.trim();
      });

      growthSection.slice(1, 4).forEach((edge, i) => {
        profile[`growth_edges_${i + 1}`] = edge.trim();
      });
    }
  }

  // Extract domain introductions
  const domains = ['theology', 'ontology', 'epistemology', 'ethics', 'politics', 'aesthetics'];
  domains.forEach(domain => {
    const domainSection = parseSection(analysisText, domain) || 
                         extractContent(analysisText, `Your approach to ${domain}`, '\n') ||
                         extractContent(analysisText, `${domain.charAt(0).toUpperCase() + domain.slice(1)}:`, '\n');
    if (domainSection) {
      profile[`${domain}_introduction`] = domainSection.trim();
    }
  });

  // Parse thinker analysis for each domain
  domains.forEach(domain => {
    const domainPattern = new RegExp(`${domain}_kindred>|${domain.charAt(0).toUpperCase() + domain.slice(1)} Kindred Spirits`);
    const challengingPattern = new RegExp(`${domain}_challenging>|${domain.charAt(0).toUpperCase() + domain.slice(1)} Challenging Voices`);
    
    const fullText = analysisText;
    const kindredStart = fullText.search(domainPattern);
    const challengingStart = fullText.search(challengingPattern);
    
    if (kindredStart !== -1) {
      const kindredSection = fullText.substring(kindredStart, challengingStart !== -1 ? challengingStart : undefined);
      const kindredMatches = kindredSection.match(/- (.*?), [""].*? \((.*?)\)(.*)/g);
      
      if (kindredMatches) {
        kindredMatches.slice(0, 5).forEach((match, i) => {
          const [name, work, rationale] = match.split(/,|\(/);
          profile[`${domain}_kindred_spirit_${i + 1}`] = name.replace('- ', '').trim();
          if (work) {
            profile[`${domain}_kindred_spirit_${i + 1}_classic`] = work.trim();
          }
          if (rationale) {
            profile[`${domain}_kindred_spirit_${i + 1}_rationale`] = rationale.replace(')', '').trim();
          }
        });
      }
    }

    if (challengingStart !== -1) {
      const challengingSection = fullText.substring(challengingStart);
      const challengingMatches = challengingSection.match(/- (.*?), [""].*? \((.*?)\)(.*)/g);
      
      if (challengingMatches) {
        challengingMatches.slice(0, 5).forEach((match, i) => {
          const [name, work, rationale] = match.split(/,|\(/);
          profile[`${domain}_challenging_voice_${i + 1}`] = name.replace('- ', '').trim();
          if (work) {
            profile[`${domain}_challenging_voice_${i + 1}_classic`] = work.trim();
          }
          if (rationale) {
            profile[`${domain}_challenging_voice_${i + 1}_rationale`] = rationale.replace(')', '').trim();
          }
        });
      }
    }
  });

  // Extract conclusion and next steps
  const concludingAnalysis = parseSection(analysisText, 'concluding_analysis');
  if (concludingAnalysis) {
    const parts = concludingAnalysis.split('\n');
    if (parts.length >= 2) {
      profile.conclusion = parts[0].trim();
      profile.next_steps = parts.slice(1).join('\n').trim();
    } else {
      profile.conclusion = concludingAnalysis.trim();
    }
  }

  return profile;
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
  <theology_kindred_spirits>
    <theology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</theology_kindred_spirit_1>
    <theology_kindred_spirit_2>[Thinker, Work (Date)]</theology_kindred_spirit_2>
    <theology_kindred_spirit_3>[Thinker, Work (Date)]</theology_kindred_spirit_3>
    <theology_kindred_spirit_4>[Thinker, Work (Date)]</theology_kindred_spirit_4>
    <theology_kindred_spirit_5>[Thinker, Work (Date)]</theology_kindred_spirit_5>
  </theology_kindred_spirits>

  <theology_challenging_voices>
    <theology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</theology_challenging_voice_1>
    <theology_challenging_voice_2>[Thinker, Work (Date)]</theology_challenging_voice_2>
    <theology_challenging_voice_3>[Thinker, Work (Date)]</theology_challenging_voice_3>
    <theology_challenging_voice_4>[Thinker, Work (Date)]</theology_challenging_voice_4>
    <theology_challenging_voice_5>[Thinker, Work (Date)]</theology_challenging_voice_5>
  </theology_challenging_voices>

  <ontology_kindred_spirits>
    <ontology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</ontology_kindred_spirit_1>
    <ontology_kindred_spirit_2>[Thinker, Work (Date)]</ontology_kindred_spirit_2>
    <ontology_kindred_spirit_3>[Thinker, Work (Date)]</ontology_kindred_spirit_3>
    <ontology_kindred_spirit_4>[Thinker, Work (Date)]</ontology_kindred_spirit_4>
    <ontology_kindred_spirit_5>[Thinker, Work (Date)]</ontology_kindred_spirit_5>
  </ontology_kindred_spirits>

  <ontology_challenging_voices>
    <ontology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</ontology_challenging_voice_1>
    <ontology_challenging_voice_2>[Thinker, Work (Date)]</ontology_challenging_voice_2>
    <ontology_challenging_voice_3>[Thinker, Work (Date)]</ontology_challenging_voice_3>
    <ontology_challenging_voice_4>[Thinker, Work (Date)]</ontology_challenging_voice_4>
    <ontology_challenging_voice_5>[Thinker, Work (Date)]</ontology_challenging_voice_5>
  </ontology_challenging_voices>
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
  <epistemology_kindred_spirits>
    <epistemology_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</epistemology_kindred_spirit_1>
    <epistemology_kindred_spirit_2>[Thinker, Work (Date)]</epistemology_kindred_spirit_2>
    <epistemology_kindred_spirit_3>[Thinker, Work (Date)]</epistemology_kindred_spirit_3>
    <epistemology_kindred_spirit_4>[Thinker, Work (Date)]</epistemology_kindred_spirit_4>
    <epistemology_kindred_spirit_5>[Thinker, Work (Date)]</epistemology_kindred_spirit_5>
  </epistemology_kindred_spirits>

  <epistemology_challenging_voices>
    <epistemology_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</epistemology_challenging_voice_1>
    <epistemology_challenging_voice_2>[Thinker, Work (Date)]</epistemology_challenging_voice_2>
    <epistemology_challenging_voice_3>[Thinker, Work (Date)]</epistemology_challenging_voice_3>
    <epistemology_challenging_voice_4>[Thinker, Work (Date)]</epistemology_challenging_voice_4>
    <epistemology_challenging_voice_5>[Thinker, Work (Date)]</epistemology_challenging_voice_5>
  </epistemology_challenging_voices>

  <ethics_kindred_spirits>
    <ethics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</ethics_kindred_spirit_1>
    <ethics_kindred_spirit_2>[Thinker, Work (Date)]</ethics_kindred_spirit_2>
    <ethics_kindred_spirit_3>[Thinker, Work (Date)]</ethics_kindred_spirit_3>
    <ethics_kindred_spirit_4>[Thinker, Work (Date)]</ethics_kindred_spirit_4>
    <ethics_kindred_spirit_5>[Thinker, Work (Date)]</ethics_kindred_spirit_5>
  </ethics_kindred_spirits>

  <ethics_challenging_voices>
    <ethics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</ethics_challenging_voice_1>
    <ethics_challenging_voice_2>[Thinker, Work (Date)]</ethics_challenging_voice_2>
    <ethics_challenging_voice_3>[Thinker, Work (Date)]</ethics_challenging_voice_3>
    <ethics_challenging_voice_4>[Thinker, Work (Date)]</ethics_challenging_voice_4>
    <ethics_challenging_voice_5>[Thinker, Work (Date)]</ethics_challenging_voice_5>
  </ethics_challenging_voices>
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
  <politics_kindred_spirits>
    <politics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</politics_kindred_spirit_1>
    <politics_kindred_spirit_2>[Thinker, Work (Date)]</politics_kindred_spirit_2>
    <politics_kindred_spirit_3>[Thinker, Work (Date)]</politics_kindred_spirit_3>
    <politics_kindred_spirit_4>[Thinker, Work (Date)]</politics_kindred_spirit_4>
    <politics_kindred_spirit_5>[Thinker, Work (Date)]</politics_kindred_spirit_5>
  </politics_kindred_spirits>

  <politics_challenging_voices>
    <politics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</politics_challenging_voice_1>
    <politics_challenging_voice_2>[Thinker, Work (Date)]</politics_challenging_voice_2>
    <politics_challenging_voice_3>[Thinker, Work (Date)]</politics_challenging_voice_3>
    <politics_challenging_voice_4>[Thinker, Work (Date)]</politics_challenging_voice_4>
    <politics_challenging_voice_5>[Thinker, Work (Date)]</politics_challenging_voice_5>
  </politics_challenging_voices>

  <aesthetics_kindred_spirits>
    <aesthetics_kindred_spirit_1>[Thinker, Work (Date) - how their argument resonates with you]</aesthetics_kindred_spirit_1>
    <aesthetics_kindred_spirit_2>[Thinker, Work (Date)]</aesthetics_kindred_spirit_2>
    <aesthetics_kindred_spirit_3>[Thinker, Work (Date)]</aesthetics_kindred_spirit_3>
    <aesthetics_kindred_spirit_4>[Thinker, Work (Date)]</aesthetics_kindred_spirit_4>
    <aesthetics_kindred_spirit_5>[Thinker, Work (Date)]</aesthetics_kindred_spirit_5>
  </aesthetics_kindred_spirits>

  <aesthetics_challenging_voices>
    <aesthetics_challenging_voice_1>[Thinker, Work (Date) - how their argument challenges you]</aesthetics_challenging_voice_1>
    <aesthetics_challenging_voice_2>[Thinker, Work (Date)]</aesthetics_challenging_voice_2>
    <aesthetics_challenging_voice_3>[Thinker, Work (Date)]</aesthetics_challenging_voice_3>
    <aesthetics_challenging_voice_4>[Thinker, Work (Date)]</aesthetics_challenging_voice_4>
    <aesthetics_challenging_voice_5>[Thinker, Work (Date)]</aesthetics_challenging_voice_5>
  </aesthetics_challenging_voices>
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

    // Combine all sections
    const completeAnalysis = `${section1}\n\n${section2}\n\n${section3}`;
    
    // Parse the complete analysis
    console.log('Parsing complete analysis...');
    const parsedProfile = parsePhilosophicalProfile(completeAnalysis);
    console.log('Parsed profile:', parsedProfile);

    // Store the complete analysis in Supabase
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
