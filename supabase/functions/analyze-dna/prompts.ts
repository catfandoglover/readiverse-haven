
export function getPromptForSection(section: number, answers_json: string): string {
  const basePrompt = `Analyze the following philosophical answers and provide insights in second person ("you"). Format your response as a valid JSON object with the exact field names shown in the template below. The JSON must be parsed by JSON.parse() without any modifications:

${answers_json}`;

  switch (section) {
    case 1:
      return `${basePrompt}

Template:
{
  "archetype": "Domain Archetype (format: [First Word] [Second Word])",
  "archetype_definition": "Brief poetic subtitle capturing essence",
  "introduction": "Opening paragraph describing philosophical approach",
  "key_tension_1": "First key tension",
  "key_tension_2": "Second key tension",
  "key_tension_3": "Third key tension",
  "natural_strength_1": "First natural strength",
  "natural_strength_2": "Second natural strength",
  "natural_strength_3": "Third natural strength",
  "growth_edges_1": "First growth edge",
  "growth_edges_2": "Second growth edge",
  "growth_edges_3": "Third growth edge",
  "become_who_you_are": "Affirmation of core strength",
  "theology_introduction": "Theology approach description",
  "ontology_introduction": "Ontology approach description"
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
  "theology_challenging_voice_5_rationale": "Challenge explanation"
}`;

    case 3:
      return `${basePrompt}

Template:
{
  "ontology_kindred_spirit_1": "First ontology kindred thinker",
  "ontology_kindred_spirit_1_classic": "Work title (date)",
  "ontology_kindred_spirit_1_rationale": "Resonance explanation",
  "ontology_kindred_spirit_2": "Second ontology kindred thinker", 
  "ontology_kindred_spirit_2_classic": "Work title (date)",
  "ontology_kindred_spirit_2_rationale": "Resonance explanation",
  "ontology_kindred_spirit_3": "Third ontology kindred thinker",
  "ontology_kindred_spirit_3_classic": "Work title (date)",
  "ontology_kindred_spirit_3_rationale": "Resonance explanation",
  "ontology_kindred_spirit_4": "Fourth ontology kindred thinker",
  "ontology_kindred_spirit_4_classic": "Work title (date)",
  "ontology_kindred_spirit_4_rationale": "Resonance explanation",
  "ontology_kindred_spirit_5": "Fifth ontology kindred thinker",
  "ontology_kindred_spirit_5_classic": "Work title (date)",
  "ontology_kindred_spirit_5_rationale": "Resonance explanation",
  "ontology_challenging_voice_1": "First ontology challenging thinker",
  "ontology_challenging_voice_1_classic": "Work title (date)",
  "ontology_challenging_voice_1_rationale": "Challenge explanation",
  "ontology_challenging_voice_2": "Second ontology challenging thinker",
  "ontology_challenging_voice_2_classic": "Work title (date)",
  "ontology_challenging_voice_2_rationale": "Challenge explanation",
  "ontology_challenging_voice_3": "Third ontology challenging thinker",
  "ontology_challenging_voice_3_classic": "Work title (date)",
  "ontology_challenging_voice_3_rationale": "Challenge explanation",
  "ontology_challenging_voice_4": "Fourth ontology challenging thinker",
  "ontology_challenging_voice_4_classic": "Work title (date)",
  "ontology_challenging_voice_4_rationale": "Challenge explanation",
  "ontology_challenging_voice_5": "Fifth ontology challenging thinker",
  "ontology_challenging_voice_5_classic": "Work title (date)",
  "ontology_challenging_voice_5_rationale": "Challenge explanation",
  "conclusion": "Overall synthesis",
  "next_steps": "Areas for exploration"
}`;

    default:
      throw new Error(`Invalid section number: ${section}`);
  }
}
