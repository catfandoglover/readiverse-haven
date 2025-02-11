
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
  <theology_kindred_spirit_1>[Thinker]</theology_kindred_spirit_1>
  <theology_kindred_spirit_1_classic>[Work (Date)]</theology_kindred_spirit_1_classic>
  <theology_kindred_spirit_1_rationale>[how their argument resonates with you]</theology_kindred_spirit_1_rationale>

  <theology_kindred_spirit_2>[Thinker]</theology_kindred_spirit_2>
  <theology_kindred_spirit_2_classic>[Work (Date)]</theology_kindred_spirit_2_classic>
  <theology_kindred_spirit_2_rationale>[how their argument resonates with you]</theology_kindred_spirit_2_rationale>

  <theology_kindred_spirit_3>[Thinker]</theology_kindred_spirit_3>
  <theology_kindred_spirit_3_classic>[Work (Date)]</theology_kindred_spirit_3_classic>
  <theology_kindred_spirit_3_rationale>[how their argument resonates with you]</theology_kindred_spirit_3_rationale>

  <theology_kindred_spirit_4>[Thinker]</theology_kindred_spirit_4>
  <theology_kindred_spirit_4_classic>[Work (Date)]</theology_kindred_spirit_4_classic>
  <theology_kindred_spirit_4_rationale>[how their argument resonates with you]</theology_kindred_spirit_4_rationale>

  <theology_kindred_spirit_5>[Thinker]</theology_kindred_spirit_5>
  <theology_kindred_spirit_5_classic>[Work (Date)]</theology_kindred_spirit_5_classic>
  <theology_kindred_spirit_5_rationale>[how their argument resonates with you]</theology_kindred_spirit_5_rationale>

  <theology_challenging_voice_1>[Thinker]</theology_challenging_voice_1>
  <theology_challenging_voice_1_classic>[Work (Date)]</theology_challenging_voice_1_classic>
  <theology_challenging_voice_1_rationale>[how their argument challenges you]</theology_challenging_voice_1_rationale>

  <theology_challenging_voice_2>[Thinker]</theology_challenging_voice_2>
  <theology_challenging_voice_2_classic>[Work (Date)]</theology_challenging_voice_2_classic>
  <theology_challenging_voice_2_rationale>[how their argument challenges you]</theology_challenging_voice_2_rationale>

  <theology_challenging_voice_3>[Thinker]</theology_challenging_voice_3>
  <theology_challenging_voice_3_classic>[Work (Date)]</theology_challenging_voice_3_classic>
  <theology_challenging_voice_3_rationale>[how their argument challenges you]</theology_challenging_voice_3_rationale>

  <theology_challenging_voice_4>[Thinker]</theology_challenging_voice_4>
  <theology_challenging_voice_4_classic>[Work (Date)]</theology_challenging_voice_4_classic>
  <theology_challenging_voice_4_rationale>[how their argument challenges you]</theology_challenging_voice_4_rationale>

  <theology_challenging_voice_5>[Thinker]</theology_challenging_voice_5>
  <theology_challenging_voice_5_classic>[Work (Date)]</theology_challenging_voice_5_classic>
  <theology_challenging_voice_5_rationale>[how their argument challenges you]</theology_challenging_voice_5_rationale>

  <ontology_kindred_spirit_1>[Thinker]</ontology_kindred_spirit_1>
  <ontology_kindred_spirit_1_classic>[Work (Date)]</ontology_kindred_spirit_1_classic>
  <ontology_kindred_spirit_1_rationale>[how their argument resonates with you]</ontology_kindred_spirit_1_rationale>

  <ontology_kindred_spirit_2>[Thinker]</ontology_kindred_spirit_2>
  <ontology_kindred_spirit_2_classic>[Work (Date)]</ontology_kindred_spirit_2_classic>
  <ontology_kindred_spirit_2_rationale>[how their argument resonates with you]</ontology_kindred_spirit_2_rationale>

  <ontology_kindred_spirit_3>[Thinker]</ontology_kindred_spirit_3>
  <ontology_kindred_spirit_3_classic>[Work (Date)]</ontology_kindred_spirit_3_classic>
  <ontology_kindred_spirit_3_rationale>[how their argument resonates with you]</ontology_kindred_spirit_3_rationale>

  <ontology_kindred_spirit_4>[Thinker]</ontology_kindred_spirit_4>
  <ontology_kindred_spirit_4_classic>[Work (Date)]</ontology_kindred_spirit_4_classic>
  <ontology_kindred_spirit_4_rationale>[how their argument resonates with you]</ontology_kindred_spirit_4_rationale>

  <ontology_kindred_spirit_5>[Thinker]</ontology_kindred_spirit_5>
  <ontology_kindred_spirit_5_classic>[Work (Date)]</ontology_kindred_spirit_5_classic>
  <ontology_kindred_spirit_5_rationale>[how their argument resonates with you]</ontology_kindred_spirit_5_rationale>

  <ontology_challenging_voice_1>[Thinker]</ontology_challenging_voice_1>
  <ontology_challenging_voice_1_classic>[Work (Date)]</ontology_challenging_voice_1_classic>
  <ontology_challenging_voice_1_rationale>[how their argument challenges you]</ontology_challenging_voice_1_rationale>

  <ontology_challenging_voice_2>[Thinker]</ontology_challenging_voice_2>
  <ontology_challenging_voice_2_classic>[Work (Date)]</ontology_challenging_voice_2_classic>
  <ontology_challenging_voice_2_rationale>[how their argument challenges you]</ontology_challenging_voice_2_rationale>

  <ontology_challenging_voice_3>[Thinker]</ontology_challenging_voice_3>
  <ontology_challenging_voice_3_classic>[Work (Date)]</ontology_challenging_voice_3_classic>
  <ontology_challenging_voice_3_rationale>[how their argument challenges you]</ontology_challenging_voice_3_rationale>

  <ontology_challenging_voice_4>[Thinker]</ontology_challenging_voice_4>
  <ontology_challenging_voice_4_classic>[Work (Date)]</ontology_challenging_voice_4_classic>
  <ontology_challenging_voice_4_rationale>[how their argument challenges you]</ontology_challenging_voice_4_rationale>

  <ontology_challenging_voice_5>[Thinker]</ontology_challenging_voice_5>
  <ontology_challenging_voice_5_classic>[Work (Date)]</ontology_challenging_voice_5_classic>
  <ontology_challenging_voice_5_rationale>[how their argument challenges you]</ontology_challenging_voice_5_rationale>
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
  <epistemology_kindred_spirit_1>[Thinker]</epistemology_kindred_spirit_1>
  <epistemology_kindred_spirit_1_classic>[Work (Date)]</epistemology_kindred_spirit_1_classic>
  <epistemology_kindred_spirit_1_rationale>[how their argument resonates with you]</epistemology_kindred_spirit_1_rationale>

  <epistemology_kindred_spirit_2>[Thinker]</epistemology_kindred_spirit_2>
  <epistemology_kindred_spirit_2_classic>[Work (Date)]</epistemology_kindred_spirit_2_classic>
  <epistemology_kindred_spirit_2_rationale>[how their argument resonates with you]</epistemology_kindred_