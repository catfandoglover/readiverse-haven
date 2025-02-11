
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
For each domain, write a sentence capturing your characteristic approach, starting with "Your approach to..."

### Thinker Analysis (Only for Theology and Ontology)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach`;
  } else if (section === 2) {
    sectionPrompt = `
### Domain Analyses (Only Epistemology and Ethics for this section)
For each domain, write a sentence capturing your characteristic approach, starting with "Your approach to..."

### Thinker Analysis (Only for Epistemology and Ethics)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach

Remember to maintain second person perspective throughout this section, explicitly using "you" and "your" in each analysis.`;
  } else {
    sectionPrompt = `
### Domain Analyses (Only Politics and Aesthetics for this section)
For each domain, write a sentence capturing your characteristic approach, starting with "Your approach to..."

### Thinker Analysis (Only for Politics and Aesthetics)
For each domain:

**Your Kindred Spirits** (5 per domain):
- Thinker, Work (date) - how their key argument resonates with your thinking

**Your Challenging Voices** (5 per domain):
- Thinker, Work (date) - how their key argument challenges your approach

## Concluding Analysis
Brief synthesis of your overall philosophical profile, highlighting key themes and potential directions for your development. Address your unique combination of approaches and where your philosophical journey might lead you next.`;
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
3. Make the analysis feel personal and directly addressed to the subject
4. Begin each domain analysis with "Your approach to..."
5. Frame all observations in terms of your personal philosophical tendencies`;

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
