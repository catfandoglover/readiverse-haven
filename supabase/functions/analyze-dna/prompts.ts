/// <reference lib="deno.ns" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// Helper function to read the mermaid content from Supabase
async function readMermaidFile(): Promise<string> {
  try {
    console.log('Attempting to fetch prompt from Supabase');
    const { data, error } = await supabase
      .from('prompts')
      .select('prompt')
      .single();
    
    if (error) {
      console.error('Error fetching mermaid content:', error);
      return '';
    }

    // Log the full prompt retrieved
    console.log('Successfully retrieved prompt from Supabase');
    console.log('Prompt content:', data.prompt);
    
    return data.prompt;
  } catch (error) {
    console.error('Error reading mermaid content:', error);
    return '';
  }
}

export async function getPromptForSection(section: number, answers_json: string): Promise<string> {
  // Read the mermaid file content
  const mermaidContent = await readMermaidFile();
  
  const basePrompt = `Analyze the following philosophical answers to the provided mermaid chart sequence of potential questions in a philosophical metaframework and provide insights in second person ("you"). Format your response as a valid JSON object with the exact field names shown in the template below. The JSON must be parsed by JSON.parse() without any modifications:
Answer requirements:
Temporal Distribution - When selecting thinkers, only select thinkers whose works were published before 1970.
Include minimum 20% pre-medieval thinkers
Represent spread across available periods
Cultural Distribution - Draw 70% from Western philosophical traditions - Draw 30% from Non-Western philosophical traditions
Selection Criteria - Mix iconic and lesser-known influential voices - Choose thinkers reflecting your specific decision tree paths - Maintain diverse perspectives within constraints.

Question sets and dna_assessment decision tree to which the answers correspond:

${mermaidContent}

${answers_json}`;

  switch (section) {
    case 1:
      return `${basePrompt}

Template:
{
  "archetype": "Archetype (format: [First Word] [Second Word]) drawn from these instructions:
  \`\`\`mermaid
  # Mythopoetic Archetype Generation System
  ## Core Components
  ### First Word Elements should describe the nature and/or state of the respondent based on their answer sequence
  ### Second Word Elements (Action/Role) should describe the action orientation of the respondent based on their answer sequence
  ## Integration Rules
  1. Pattern Analysis:
  \`\`\`
  Analyze:
  - Domain specific responses and how their responses across domains reflect their philosophical bent and action orientation
  - Pattern sequence
  - Domain context
  \`\`\`
  1. Element Selection:
  \`\`\`
  Choose first word based on:
  - Pattern type
  - Domain nature
  - Overall profile
  \`\`\`
  1. Role Assignment:
  \`\`\`
  Choose second word based on:
  - Action pattern
  - Integration needs
  - Profile balance
  \`\`\`
  1. Resonance Check:
  \`\`\`
  Verify:
  - Metaphoric coherence
  - Philosophical accuracy
  - Poetic resonance
  \`\`\`
  ## Quality Guidelines
  1. Archetype Criteria:
  - Must capture philosophical orientation
  - Should feel mythologically resonant
  - Must maintain consistency across profiles
  - Should be immediately evocative
  1. Combination Rules:
  - Elements must complement
  - Avoid redundancy
  - Maintain metaphoric coherence
  - Create clear image
  1. Verification Steps:
  - Check pattern match
  - Verify philosophical fit
  - Test resonance
  - Ensure distinctiveness
  ## Application Process
  1. For Overall Archetype:
  \`\`\`
  a) Analyze full pattern across domains b) Identify dominant tendencies c) Select appropriate elements d) Test combination e) Verify fit
  \`\`\`
  2. For Domain Archetypes:
  \`\`\`
  a) Analyze specific pattern b) Consider domain context c) Select domain-appropriate elements d) Test combination e) Verify domain fit
  \`\`\`
  3. Quality Control:
  \`\`\`
  a) Check consistency b) Verify distinctiveness c) Test resonance d) Confirm accuracy
  \`\`\`
  Remember: Archetypes should be both meaningful and memorable, capturing deep philosophical patterns while remaining accessible and evocative.
  \`\`\`",
  "archetype_definition": "Brief poetic subtitle capturing essence",
  "introduction": "Opening paragraph, around 40 words, describing philosophical approach and how you move through philosophical space - focus on how you reconcile contradictions and approach meaning-making - Written in direct address: \"You are...\" \"Your approach...\"",
  "key_tension_1": "First key tension, one of three primary dialectics you navigate, written as a third person active tense bullet point such as \"Wrestles with...\" \"Balances...\" or \"Navigates...\".",
  "key_tension_2": "Second key tension, one of three primary dialectics you navigate, written as a third person active tense bullet point such as \"Wrestles with...\" \"Balances...\" or \"Navigates...\". Do not repeat the dialectic theme from \"key_tension_1\".",
  "key_tension_3": "Third key tension, one of three primary dialectics you navigate, written as a third person active tense bullet point such as \"Wrestles with...\" \"Balances...\" or \"Navigates...\". Do not repeat the dialectic theme from \"key_tension_1\" or \"key_tension_2\".",
  "natural_strength_1": "First natural strength - one of three inherent capacities you bring, written as a third person active tense bullet point such as \"Excels at...\" or \"Maintains...\" or \"Integrates...\" or \"Delivers\"... or \"synthesizes\".",
  "natural_strength_2": "Second natural strength - one of three inherent capacities you bring, written as a third person active tense bullet point such as \"Excels at...\" or \"Maintains...\" or \"Integrates...\" or \"Delivers\"... or \"synthesizes\". Do not repeat the inherent capacities from \"natural_strength_1\".",
  "natural_strength_3": "Third natural strength - one of three inherent capacities you bring, written as a third person active tense bullet point such as \"Excels at...\" or \"Maintains...\" or \"Integrates...\" or \"Delivers\"... or \"synthesizes\". Do not repeat the inherent capacities from \"natural_strength_1\" or \"natural_strength_2\".",
  "growth_edges_1": "First growth edge - one of three areas where you're called to develop, focusing on which aspect of themselves revealed by the assessment they should accept, written as a second person, command tense bullet point such as \"Accept...\"",
  "growth_edges_2": "Second growth edge - one of three areas where you're called to develop, focusing on which aspect of themselves revealed by the assessment they should further develop, written as a second person, command tense bullet point such as \"Develop...\"",
  "growth_edges_3": "Third growth edge - one of three areas where you're called to develop, focusing on which aspect of themselves revealed by the assessment they should expand and stretch beyond their comfort zone, written as a second person, command tense bullet point such as \"Expand...\" or \"Stretch...\"",
  "become_who_you_are": "Single-sentence affirmation validating your core strength while addressing your key tension - Written as direct encouragement: \"Trust your capacity to...\"",
  "theology_introduction": "Theology approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "ontology_introduction": "Ontology approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "epistemology_introduction": "Epistemology approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "ethics_introduction": "Ethics approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "politics_introduction": "Politics approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "aesthetics_introduction": "Aesthetics approach description - Specific to the philosophical pattern of their assessment responses - Avoid generic characterizations - Connect to decision tree choices",
  "politics_kindred_spirit_1": "First politics kindred thinker",
  "politics_kindred_spirit_1_classic": "Work title (date)",
  "politics_kindred_spirit_1_rationale": "Resonance explanation",
  "politics_kindred_spirit_2": "Second politics kindred thinker",
  "politics_kindred_spirit_2_classic": "Work title (date)",
  "politics_kindred_spirit_2_rationale": "Resonance explanation",
  "politics_kindred_spirit_3": "Third politics kindred thinker",
  "politics_kindred_spirit_3_classic": "Work title (date)",
  "politics_kindred_spirit_3_rationale": "Resonance explanation",
  "politics_kindred_spirit_4": "Fourth politics kindred thinker",
  "politics_kindred_spirit_4_classic": "Work title (date)",
  "politics_kindred_spirit_4_rationale": "Resonance explanation",
  "politics_kindred_spirit_5": "Fifth politics kindred thinker",
  "politics_kindred_spirit_5_classic": "Work title (date)",
  "politics_kindred_spirit_5_rationale": "Resonance explanation",
  "politics_challenging_voice_1": "First politics challenging thinker",
  "politics_challenging_voice_1_classic": "Work title (date)",
  "politics_challenging_voice_1_rationale": "Challenge explanation",
  "politics_challenging_voice_2": "Second politics challenging thinker",
  "politics_challenging_voice_2_classic": "Work title (date)",
  "politics_challenging_voice_2_rationale": "Challenge explanation",
  "politics_challenging_voice_3": "Third politics challenging thinker",
  "politics_challenging_voice_3_classic": "Work title (date)",
  "politics_challenging_voice_3_rationale": "Challenge explanation",
  "politics_challenging_voice_4": "Fourth politics challenging thinker",
  "politics_challenging_voice_4_classic": "Work title (date)",
  "politics_challenging_voice_4_rationale": "Challenge explanation",
  "politics_challenging_voice_5": "Fifth politics challenging thinker",
  "politics_challenging_voice_5_classic": "Work title (date)",
  "politics_challenging_voice_5_rationale": "Challenge explanation"
}`;
    
    case 2:
      return `${basePrompt}

Template:
{
  "theology_kindred_spirit_1": "First theology kindred thinker",
  "theology_kindred_spirit_1_classic": "Work title (date)",
  "theology_kindred_spirit_1_rationale": "Resonance explanation",
  "theology_kindred_spirit_2": "Second theology kindred thinker",
  "theology_kindred_spirit_2_classic": "Work title (date)",
  "theology_kindred_spirit_2_rationale": "Resonance explanation",
  "theology_kindred_spirit_3": "Third theology kindred thinker",
  "theology_kindred_spirit_3_classic": "Work title (date)",
  "theology_kindred_spirit_3_rationale": "Resonance explanation",
  "theology_kindred_spirit_4": "Fourth theology kindred thinker",
  "theology_kindred_spirit_4_classic": "Work title (date)",
  "theology_kindred_spirit_4_rationale": "Resonance explanation",
  "theology_kindred_spirit_5": "Fifth theology kindred thinker",
  "theology_kindred_spirit_5_classic": "Work title (date)",
  "theology_kindred_spirit_5_rationale": "Resonance explanation",
  "theology_challenging_voice_1": "First theology challenging thinker",
  "theology_challenging_voice_1_classic": "Work title (date)",
  "theology_challenging_voice_1_rationale": "Challenge explanation",
  "theology_challenging_voice_2": "Second theology challenging thinker",
  "theology_challenging_voice_2_classic": "Work title (date)",
  "theology_challenging_voice_2_rationale": "Challenge explanation",
  "theology_challenging_voice_3": "Third theology challenging thinker",
  "theology_challenging_voice_3_classic": "Work title (date)",
  "theology_challenging_voice_3_rationale": "Challenge explanation",
  "theology_challenging_voice_4": "Fourth theology challenging thinker",
  "theology_challenging_voice_4_classic": "Work title (date)",
  "theology_challenging_voice_4_rationale": "Challenge explanation",
  "theology_challenging_voice_5": "Fifth theology challenging thinker",
  "theology_challenging_voice_5_classic": "Work title (date)",
  "theology_challenging_voice_5_rationale": "Challenge explanation",
  "epistemology_kindred_spirit_1": "First epistemology kindred thinker",
  "epistemology_kindred_spirit_1_classic": "Work title (date)",
  "epistemology_kindred_spirit_1_rationale": "Resonance explanation",
  "epistemology_kindred_spirit_2": "Second epistemology kindred thinker",
  "epistemology_kindred_spirit_2_classic": "Work title (date)",
  "epistemology_kindred_spirit_2_rationale": "Resonance explanation",
  "epistemology_kindred_spirit_3": "Third epistemology kindred thinker",
  "epistemology_kindred_spirit_3_classic": "Work title (date)",
  "epistemology_kindred_spirit_3_rationale": "Resonance explanation",
  "epistemology_kindred_spirit_4": "Fourth epistemology kindred thinker",
  "epistemology_kindred_spirit_4_classic": "Work title (date)",
  "epistemology_kindred_spirit_4_rationale": "Resonance explanation",
  "epistemology_kindred_spirit_5": "Fifth epistemology kindred thinker",
  "epistemology_kindred_spirit_5_classic": "Work title (date)",
  "epistemology_kindred_spirit_5_rationale": "Resonance explanation",
  "epistemology_challenging_voice_1": "First epistemology challenging thinker",
  "epistemology_challenging_voice_1_classic": "Work title (date)",
  "epistemology_challenging_voice_1_rationale": "Challenge explanation",
  "epistemology_challenging_voice_2": "Second epistemology challenging thinker",
  "epistemology_challenging_voice_2_classic": "Work title (date)",
  "epistemology_challenging_voice_2_rationale": "Challenge explanation",
  "epistemology_challenging_voice_3": "Third epistemology challenging thinker",
  "epistemology_challenging_voice_3_classic": "Work title (date)",
  "epistemology_challenging_voice_3_rationale": "Challenge explanation",
  "epistemology_challenging_voice_4": "Fourth epistemology challenging thinker",
  "epistemology_challenging_voice_4_classic": "Work title (date)",
  "epistemology_challenging_voice_4_rationale": "Challenge explanation",
  "epistemology_challenging_voice_5": "Fifth epistemology challenging thinker",
  "epistemology_challenging_voice_5_classic": "Work title (date)",
  "epistemology_challenging_voice_5_rationale": "Challenge explanation",
  "ethics_kindred_spirit_1": "First ethics kindred thinker",
  "ethics_kindred_spirit_1_classic": "Work title (date)",
  "ethics_kindred_spirit_1_rationale": "Resonance explanation",
  "ethics_kindred_spirit_2": "Second ethics kindred thinker",
  "ethics_kindred_spirit_2_classic": "Work title (date)",
  "ethics_kindred_spirit_2_rationale": "Resonance explanation",
  "ethics_kindred_spirit_3": "Third ethics kindred thinker",
  "ethics_kindred_spirit_3_classic": "Work title (date)",
  "ethics_kindred_spirit_3_rationale": "Resonance explanation",
  "ethics_kindred_spirit_4": "Fourth ethics kindred thinker",
  "ethics_kindred_spirit_4_classic": "Work title (date)",
  "ethics_kindred_spirit_4_rationale": "Resonance explanation",
  "ethics_kindred_spirit_5": "Fifth ethics kindred thinker",
  "ethics_kindred_spirit_5_classic": "Work title (date)",
  "ethics_kindred_spirit_5_rationale": "Resonance explanation",
  "ethics_challenging_voice_1": "First ethics challenging thinker",
  "ethics_challenging_voice_1_classic": "Work title (date)",
  "ethics_challenging_voice_1_rationale": "Challenge explanation",
  "ethics_challenging_voice_2": "Second ethics challenging thinker",
  "ethics_challenging_voice_2_classic": "Work title (date)",
  "ethics_challenging_voice_2_rationale": "Challenge explanation",
  "ethics_challenging_voice_3": "Third ethics challenging thinker",
  "ethics_challenging_voice_3_classic": "Work title (date)",
  "ethics_challenging_voice_3_rationale": "Challenge explanation",
  "ethics_challenging_voice_4": "Fourth ethics challenging thinker",
  "ethics_challenging_voice_4_classic": "Work title (date)",
  "ethics_challenging_voice_4_rationale": "Challenge explanation",
  "ethics_challenging_voice_5": "Fifth ethics challenging thinker",
  "ethics_challenging_voice_5_classic": "Work title (date)",
  "ethics_challenging_voice_5_rationale": "Challenge explanation"
}`;
    
    default:
      throw new Error(`Invalid section number: ${section}`);
  }
}
