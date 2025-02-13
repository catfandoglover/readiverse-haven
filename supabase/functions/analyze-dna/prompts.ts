export function getPromptForSection(section: number, answers_json: string): string {
  const template: Record<number, string> = {
    1: `Given these philosophical assessment answers: ${answers_json}

You must return ONLY a valid JSON object with no additional text, markdown, or formatting. Follow these strict requirements:

1. Format Requirements:
- Return ONLY the JSON object, nothing else
- No markdown, no mermaid diagrams, no additional formatting
- No explanations or text outside the JSON
- No quotes within field values
- All text must be in second person (you/your)

2. Content Guidelines:
- All fields marked as [2-3 sentences] must be exactly 2-3 sentences long
- Be concise and direct
- No metaphors or poetic language unless explicitly requested
- No bullet points or lists within values

Return this exact JSON structure:
{
  "archetype": "[Exactly two words: First Word] [Second Word]",
  "archetype_definition": "[Single sentence, max 10 words]",
  "introduction": "[2-3 sentences] Factual overview of philosophical approach",
  "key_tension_1": "[2-3 sentences] Main philosophical tension and navigation",
  "key_tension_2": "[2-3 sentences] Second philosophical tension and navigation",
  "key_tension_3": "[2-3 sentences] Third philosophical tension and navigation",
  "natural_strength_1": "[2-3 sentences] First philosophical strength and context",
  "natural_strength_2": "[2-3 sentences] Second philosophical strength and context",
  "natural_strength_3": "[2-3 sentences] Third philosophical strength and context",
  "growth_edges_1": "[2-3 sentences] First growth area with challenge and potential",
  "growth_edges_2": "[2-3 sentences] Second growth area with challenge and potential",
  "growth_edges_3": "[2-3 sentences] Third growth area with challenge and potential",
  "become_who_you_are": "[Single sentence affirmation]",
  "theology_introduction": "[2-3 sentences] Theology approach overview",
  "ontology_introduction": "[2-3 sentences] Ontology approach overview",
  "theology_kindred_spirit_1": "[Single name]",
  "theology_kindred_spirit_1_classic": "[Work title] ([Year])",
  "theology_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "theology_kindred_spirit_2": "[Single name]",
  "theology_kindred_spirit_2_classic": "[Work title] ([Year])",
  "theology_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "theology_kindred_spirit_3": "[Single name]",
  "theology_kindred_spirit_3_classic": "[Work title] ([Year])",
  "theology_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "theology_kindred_spirit_4": "[Single name]",
  "theology_kindred_spirit_4_classic": "[Work title] ([Year])",
  "theology_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "theology_kindred_spirit_5": "[Single name]",
  "theology_kindred_spirit_5_classic": "[Work title] ([Year])",
  "theology_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "theology_challenging_voice_1": "[Single name]",
  "theology_challenging_voice_1_classic": "[Work title] ([Year])",
  "theology_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "theology_challenging_voice_2": "[Single name]",
  "theology_challenging_voice_2_classic": "[Work title] ([Year])",
  "theology_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "theology_challenging_voice_3": "[Single name]",
  "theology_challenging_voice_3_classic": "[Work title] ([Year])",
  "theology_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "theology_challenging_voice_4": "[Single name]",
  "theology_challenging_voice_4_classic": "[Work title] ([Year])",
  "theology_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "theology_challenging_voice_5": "[Single name]",
  "theology_challenging_voice_5_classic": "[Work title] ([Year])",
  "theology_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation",
  "ontology_kindred_spirit_1": "[Single name]",
  "ontology_kindred_spirit_1_classic": "[Work title] ([Year])",
  "ontology_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "ontology_kindred_spirit_2": "[Single name]",
  "ontology_kindred_spirit_2_classic": "[Work title] ([Year])", 
  "ontology_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "ontology_kindred_spirit_3": "[Single name]",
  "ontology_kindred_spirit_3_classic": "[Work title] ([Year])",
  "ontology_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "ontology_kindred_spirit_4": "[Single name]",
  "ontology_kindred_spirit_4_classic": "[Work title] ([Year])",
  "ontology_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "ontology_kindred_spirit_5": "[Single name]",
  "ontology_kindred_spirit_5_classic": "[Work title] ([Year])",
  "ontology_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "ontology_challenging_voice_1": "[Single name]",
  "ontology_challenging_voice_1_classic": "[Work title] ([Year])",
  "ontology_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "ontology_challenging_voice_2": "[Single name]",
  "ontology_challenging_voice_2_classic": "[Work title] ([Year])",
  "ontology_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "ontology_challenging_voice_3": "[Single name]",
  "ontology_challenging_voice_3_classic": "[Work title] ([Year])",
  "ontology_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "ontology_challenging_voice_4": "[Single name]",
  "ontology_challenging_voice_4_classic": "[Work title] ([Year])",
  "ontology_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "ontology_challenging_voice_5": "[Single name]",
  "ontology_challenging_voice_5_classic": "[Work title] ([Year])",
  "ontology_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation"
}`,

    2: `Given these philosophical assessment answers: ${answers_json}

You must return ONLY a valid JSON object with no additional text, markdown, or formatting. Follow these strict requirements:

1. Format Requirements:
- Return ONLY the JSON object, nothing else
- No markdown, no mermaid diagrams, no additional formatting
- No explanations or text outside the JSON
- No quotes within field values
- All text must be in second person (you/your)

2. Content Guidelines:
- All rationale fields must be 1-2 sentences
- Be concise and direct
- No metaphors or poetic language
- No bullet points or lists within values

Return this exact JSON structure:
{
  "epistemology_introduction": "[2-3 sentences] Epistemology approach overview",
  "ethics_introduction": "[2-3 sentences] Ethics approach overview",
  "epistemology_kindred_spirit_1": "[Single name]",
  "epistemology_kindred_spirit_1_classic": "[Work title] ([Year])",
  "epistemology_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "epistemology_kindred_spirit_2": "[Single name]",
  "epistemology_kindred_spirit_2_classic": "[Work title] ([Year])",
  "epistemology_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "epistemology_kindred_spirit_3": "[Single name]",
  "epistemology_kindred_spirit_3_classic": "[Work title] ([Year])",
  "epistemology_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "epistemology_kindred_spirit_4": "[Single name]",
  "epistemology_kindred_spirit_4_classic": "[Work title] ([Year])",
  "epistemology_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "epistemology_kindred_spirit_5": "[Single name]",
  "epistemology_kindred_spirit_5_classic": "[Work title] ([Year])",
  "epistemology_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "epistemology_challenging_voice_1": "[Single name]",
  "epistemology_challenging_voice_1_classic": "[Work title] ([Year])",
  "epistemology_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "epistemology_challenging_voice_2": "[Single name]",
  "epistemology_challenging_voice_2_classic": "[Work title] ([Year])",
  "epistemology_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "epistemology_challenging_voice_3": "[Single name]",
  "epistemology_challenging_voice_3_classic": "[Work title] ([Year])",
  "epistemology_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "epistemology_challenging_voice_4": "[Single name]",
  "epistemology_challenging_voice_4_classic": "[Work title] ([Year])",
  "epistemology_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "epistemology_challenging_voice_5": "[Single name]",
  "epistemology_challenging_voice_5_classic": "[Work title] ([Year])",
  "epistemology_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation",
  "ethics_kindred_spirit_1": "[Single name]",
  "ethics_kindred_spirit_1_classic": "[Work title] ([Year])",
  "ethics_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "ethics_kindred_spirit_2": "[Single name]",
  "ethics_kindred_spirit_2_classic": "[Work title] ([Year])",
  "ethics_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "ethics_kindred_spirit_3": "[Single name]",
  "ethics_kindred_spirit_3_classic": "[Work title] ([Year])",
  "ethics_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "ethics_kindred_spirit_4": "[Single name]",
  "ethics_kindred_spirit_4_classic": "[Work title] ([Year])",
  "ethics_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "ethics_kindred_spirit_5": "[Single name]",
  "ethics_kindred_spirit_5_classic": "[Work title] ([Year])",
  "ethics_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "ethics_challenging_voice_1": "[Single name]",
  "ethics_challenging_voice_1_classic": "[Work title] ([Year])",
  "ethics_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "ethics_challenging_voice_2": "[Single name]",
  "ethics_challenging_voice_2_classic": "[Work title] ([Year])",
  "ethics_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "ethics_challenging_voice_3": "[Single name]",
  "ethics_challenging_voice_3_classic": "[Work title] ([Year])",
  "ethics_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "ethics_challenging_voice_4": "[Single name]",
  "ethics_challenging_voice_4_classic": "[Work title] ([Year])",
  "ethics_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "ethics_challenging_voice_5": "[Single name]",
  "ethics_challenging_voice_5_classic": "[Work title] ([Year])",
  "ethics_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation"
}`,

    3: `Given these philosophical assessment answers: ${answers_json}

You must return ONLY a valid JSON object with no additional text, markdown, or formatting. Follow these strict requirements:

1. Format Requirements:
- Return ONLY the JSON object, nothing else
- No markdown, no mermaid diagrams, no additional formatting
- No explanations or text outside the JSON
- No quotes within field values
- All text must be in second person (you/your)

2. Content Guidelines:
- All rationale fields must be 1-2 sentences
- Be concise and direct
- No metaphors or poetic language
- No bullet points or lists within values

Return this exact JSON structure:
{
  "politics_introduction": "[2-3 sentences] Politics approach overview",
  "aesthetics_introduction": "[2-3 sentences] Aesthetics approach overview",
  "politics_kindred_spirit_1": "[Single name]",
  "politics_kindred_spirit_1_classic": "[Work title] ([Year])",
  "politics_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "politics_kindred_spirit_2": "[Single name]",
  "politics_kindred_spirit_2_classic": "[Work title] ([Year])",
  "politics_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "politics_kindred_spirit_3": "[Single name]",
  "politics_kindred_spirit_3_classic": "[Work title] ([Year])",
  "politics_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "politics_kindred_spirit_4": "[Single name]",
  "politics_kindred_spirit_4_classic": "[Work title] ([Year])",
  "politics_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "politics_kindred_spirit_5": "[Single name]",
  "politics_kindred_spirit_5_classic": "[Work title] ([Year])",
  "politics_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "politics_challenging_voice_1": "[Single name]",
  "politics_challenging_voice_1_classic": "[Work title] ([Year])",
  "politics_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "politics_challenging_voice_2": "[Single name]",
  "politics_challenging_voice_2_classic": "[Work title] ([Year])",
  "politics_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "politics_challenging_voice_3": "[Single name]",
  "politics_challenging_voice_3_classic": "[Work title] ([Year])",
  "politics_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "politics_challenging_voice_4": "[Single name]",
  "politics_challenging_voice_4_classic": "[Work title] ([Year])",
  "politics_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "politics_challenging_voice_5": "[Single name]",
  "politics_challenging_voice_5_classic": "[Work title] ([Year])",
  "politics_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation",
  "aesthetics_kindred_spirit_1": "[Single name]",
  "aesthetics_kindred_spirit_1_classic": "[Work title] ([Year])",
  "aesthetics_kindred_spirit_1_rationale": "[1-2 sentences] Connection explanation",
  "aesthetics_kindred_spirit_2": "[Single name]",
  "aesthetics_kindred_spirit_2_classic": "[Work title] ([Year])",
  "aesthetics_kindred_spirit_2_rationale": "[1-2 sentences] Connection explanation",
  "aesthetics_kindred_spirit_3": "[Single name]",
  "aesthetics_kindred_spirit_3_classic": "[Work title] ([Year])",
  "aesthetics_kindred_spirit_3_rationale": "[1-2 sentences] Connection explanation",
  "aesthetics_kindred_spirit_4": "[Single name]",
  "aesthetics_kindred_spirit_4_classic": "[Work title] ([Year])",
  "aesthetics_kindred_spirit_4_rationale": "[1-2 sentences] Connection explanation",
  "aesthetics_kindred_spirit_5": "[Single name]",
  "aesthetics_kindred_spirit_5_classic": "[Work title] ([Year])",
  "aesthetics_kindred_spirit_5_rationale": "[1-2 sentences] Connection explanation",
  "aesthetics_challenging_voice_1": "[Single name]",
  "aesthetics_challenging_voice_1_classic": "[Work title] ([Year])",
  "aesthetics_challenging_voice_1_rationale": "[1-2 sentences] Challenge explanation",
  "aesthetics_challenging_voice_2": "[Single name]",
  "aesthetics_challenging_voice_2_classic": "[Work title] ([Year])",
  "aesthetics_challenging_voice_2_rationale": "[1-2 sentences] Challenge explanation",
  "aesthetics_challenging_voice_3": "[Single name]",
  "aesthetics_challenging_voice_3_classic": "[Work title] ([Year])",
  "aesthetics_challenging_voice_3_rationale": "[1-2 sentences] Challenge explanation",
  "aesthetics_challenging_voice_4": "[Single name]",
  "aesthetics_challenging_voice_4_classic": "[Work title] ([Year])",
  "aesthetics_challenging_voice_4_rationale": "[1-2 sentences] Challenge explanation",
  "aesthetics_challenging_voice_5": "[Single name]",
  "aesthetics_challenging_voice_5_classic": "[Work title] ([Year])",
  "aesthetics_challenging_voice_5_rationale": "[1-2 sentences] Challenge explanation",
  "conclusion": "[3-4 sentences] Overall synthesis of philosophical profile",
  "next_steps": "[2-3 sentences] Concrete areas for philosophical exploration"
}`
  };

  return template[section] || '';
}
