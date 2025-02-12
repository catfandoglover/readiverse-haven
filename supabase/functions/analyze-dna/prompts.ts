
export function getPromptForSection(section: number, answers_json: string): string {
  const archetypeGuide = `Archetype Generation Guidelines:
First Word Elements should be chosen from:
- Light Elements: Dawn (emerging), Twilight (balanced), Horizon (boundary), Star (guiding), Moon (reflected)
- Earth Elements: Mountain (height), River (flow), Forest (complexity), Cave (depth), Garden (cultivation)
- Space Elements: Bridge (connection), Gate (threshold), Path (journey), Tower (perspective), Well (depth)
- Fire Elements: Flame (transformation), Forge (creation), Hearth (nurture), Beacon (guidance), Spark (inspiration)

Second Word Elements should be chosen from:
- Knowledge Actions: Weaver (integration), Seeker (exploration), Builder (construction), Keeper (preservation), Navigator (guidance)
- Wisdom Roles: Sage (understanding), Explorer (discovery), Architect (design), Guardian (protection), Alchemist (transformation)
- Bridge Roles: Mediator (connection), Harmonizer (balance), Translator (interpretation), Walker (journey), Dancer (flow)

Archetype Rules:
1. Pattern Analysis: Consider dominant patterns in philosophical answers
2. Element Selection: Choose first word based on pattern type and domain
3. Role Assignment: Choose second word based on action patterns
4. Verify philosophical accuracy and poetic resonance
5. Ensure metaphoric coherence and distinctiveness`;

  const systemRequirements = `${archetypeGuide}

Thinker Selection Requirements:
Temporal Distribution
- Select no thinkers after 1980
- Include minimum 20% pre-medieval thinkers
- Represent spread across available periods
Cultural Distribution
- Draw 70% from Western philosophical traditions
- Draw 30% from Non-Western philosophical traditions
Selection Criteria
- Mix iconic and lesser-known influential voices
- Choose thinkers reflecting your specific decision tree paths
- Summarize arguments in one distinctive line
- Pair each thinker with their most relevant major work
- Maintain diverse perspectives within constraints
Domain Description Requirements
- Specific to your philosophical pattern
- Avoid generic characterizations
- Connect to your decision tree choices
- Always written in second person ("you," "your")`;

  const basePrompt = `${systemRequirements}

Here are your answers to the philosophical questions:

${answers_json}

Format your response as a FLAT JSON object with NO nesting. Use the exact field names specified in the template below.`;

  const templates = {
    1: `For Section 1 (Theology & Ontology), provide a JSON object with these exact fields:

{
  "archetype": "Domain Archetype (format: [First Word] [Second Word], chosen from the approved elements list)",
  "archetype_definition": "Brief poetic subtitle capturing essence",
  "introduction": "Opening paragraph describing how you move through philosophical space - focus on how you reconcile contradictions and approach meaning-making. Written in direct address: 'You are...' 'Your approach...'",
  "key_tension_1": "One of three primary dialectics you navigate, written as 'You find yourself balancing...' or 'You often wrestle with...'",
  "key_tension_2": "One of three primary dialectics you navigate, written as 'You find yourself balancing...' or 'You often wrestle with...'",
  "key_tension_3": "One of three primary dialectics you navigate, written as 'You find yourself balancing...' or 'You often wrestle with...'",
  "natural_strength_1": "One of three inherent capacities you bring, written as 'You excel at...' or 'Your natural ability to...'",
  "natural_strength_2": "Three inherent capacities you bring, written as 'You excel at...' or 'Your natural ability to...'",
  "natural_strength_3": "Three inherent capacities you bring, written as 'You excel at...' or 'Your natural ability to...'",
  "growth_edges_1": "One of three areas where you're called to develop, written as 'You are learning to...' or 'Your path invites you to...'",
  "growth_edges_2": "One of three areas where you're called to develop, written as 'You are learning to...' or 'Your path invites you to...'",
  "growth_edges_3": "One of three areas where you're called to develop, written as 'You are learning to...' or 'Your path invites you to...'",
  "become_who_you_are": "Single-sentence affirmation validating your core strength while addressing your key tension. Written as direct encouragement: 'Trust your capacity to...'",
  "theology_introduction": "1-2 sentences capturing your characteristic approach to theology, written as 'In theology, you tend to...'",
  "ontology_introduction": "1-2 sentences capturing your characteristic approach to ontology, written as 'In ontology, you tend to...'",
  "theology_kindred_spirit_1": "Thinker name",
  "theology_kindred_spirit_1_classic": "Work (Date)",
  "theology_kindred_spirit_1_rationale": "How their argument resonates",
  "theology_kindred_spirit_2": "Thinker name",
  "theology_kindred_spirit_2_classic": "Work (Date)",
  "theology_kindred_spirit_2_rationale": "How their argument resonates",
  "theology_kindred_spirit_3": "Thinker name",
  "theology_kindred_spirit_3_classic": "Work (Date)",
  "theology_kindred_spirit_3_rationale": "How their argument resonates",
  "theology_kindred_spirit_4": "Thinker name",
  "theology_kindred_spirit_4_classic": "Work (Date)",
  "theology_kindred_spirit_4_rationale": "How their argument resonates",
  "theology_kindred_spirit_5": "Thinker name",
  "theology_kindred_spirit_5_classic": "Work (Date)",
  "theology_kindred_spirit_5_rationale": "How their argument resonates",
  "theology_challenging_voice_1": "Thinker name",
  "theology_challenging_voice_1_classic": "Work (Date)",
  "theology_challenging_voice_1_rationale": "How their argument challenges",
  "theology_challenging_voice_2": "Thinker name",
  "theology_challenging_voice_2_classic": "Work (Date)",
  "theology_challenging_voice_2_rationale": "How their argument challenges",
  "theology_challenging_voice_3": "Thinker name",
  "theology_challenging_voice_3_classic": "Work (Date)",
  "theology_challenging_voice_3_rationale": "How their argument challenges",
  "theology_challenging_voice_4": "Thinker name",
  "theology_challenging_voice_4_classic": "Work (Date)",
  "theology_challenging_voice_4_rationale": "How their argument challenges",
  "theology_challenging_voice_5": "Thinker name",
  "theology_challenging_voice_5_classic": "Work (Date)",
  "theology_challenging_voice_5_rationale": "How their argument challenges",
  "ontology_kindred_spirit_1": "Thinker name",
  "ontology_kindred_spirit_1_classic": "Work (Date)",
  "ontology_kindred_spirit_1_rationale": "How their argument resonates",
  "ontology_kindred_spirit_2": "Thinker name",
  "ontology_kindred_spirit_2_classic": "Work (Date)",
  "ontology_kindred_spirit_2_rationale": "How their argument resonates",
  "ontology_kindred_spirit_3": "Thinker name",
  "ontology_kindred_spirit_3_classic": "Work (Date)",
  "ontology_kindred_spirit_3_rationale": "How their argument resonates",
  "ontology_kindred_spirit_4": "Thinker name",
  "ontology_kindred_spirit_4_classic": "Work (Date)",
  "ontology_kindred_spirit_4_rationale": "How their argument resonates",
  "ontology_kindred_spirit_5": "Thinker name",
  "ontology_kindred_spirit_5_classic": "Work (Date)",
  "ontology_kindred_spirit_5_rationale": "How their argument resonates",
  "ontology_challenging_voice_1": "Thinker name",
  "ontology_challenging_voice_1_classic": "Work (Date)",
  "ontology_challenging_voice_1_rationale": "How their argument challenges",
  "ontology_challenging_voice_2": "Thinker name",
  "ontology_challenging_voice_2_classic": "Work (Date)",
  "ontology_challenging_voice_2_rationale": "How their argument challenges",
  "ontology_challenging_voice_3": "Thinker name",
  "ontology_challenging_voice_3_classic": "Work (Date)",
  "ontology_challenging_voice_3_rationale": "How their argument challenges",
  "ontology_challenging_voice_4": "Thinker name",
  "ontology_challenging_voice_4_classic": "Work (Date)",
  "ontology_challenging_voice_4_rationale": "How their argument challenges",
  "ontology_challenging_voice_5": "Thinker name",
  "ontology_challenging_voice_5_classic": "Work (Date)",
  "ontology_challenging_voice_5_rationale": "How their argument challenges"
}`,

    2: `For Section 2 (Epistemology & Ethics), provide a JSON object with these exact fields:

{
  "epistemology_introduction": "1-2 sentences capturing your characteristic approach to epistemology, written as 'In epistemology, you tend to...'",
  "ethics_introduction": "1-2 sentences capturing your characteristic approach to ethics, written as 'In ethics, you tend to...'",
  "epistemology_kindred_spirit_1": "Thinker name",
  "epistemology_kindred_spirit_1_classic": "Work (Date)",
  "epistemology_kindred_spirit_1_rationale": "How their argument resonates",
  "epistemology_kindred_spirit_2": "Thinker name",
  "epistemology_kindred_spirit_2_classic": "Work (Date)",
  "epistemology_kindred_spirit_2_rationale": "How their argument resonates",
  "epistemology_kindred_spirit_3": "Thinker name",
  "epistemology_kindred_spirit_3_classic": "Work (Date)",
  "epistemology_kindred_spirit_3_rationale": "How their argument resonates",
  "epistemology_kindred_spirit_4": "Thinker name",
  "epistemology_kindred_spirit_4_classic": "Work (Date)",
  "epistemology_kindred_spirit_4_rationale": "How their argument resonates",
  "epistemology_kindred_spirit_5": "Thinker name",
  "epistemology_kindred_spirit_5_classic": "Work (Date)",
  "epistemology_kindred_spirit_5_rationale": "How their argument resonates",
  "epistemology_challenging_voice_1": "Thinker name",
  "epistemology_challenging_voice_1_classic": "Work (Date)",
  "epistemology_challenging_voice_1_rationale": "How their argument challenges",
  "epistemology_challenging_voice_2": "Thinker name",
  "epistemology_challenging_voice_2_classic": "Work (Date)",
  "epistemology_challenging_voice_2_rationale": "How their argument challenges",
  "epistemology_challenging_voice_3": "Thinker name",
  "epistemology_challenging_voice_3_classic": "Work (Date)",
  "epistemology_challenging_voice_3_rationale": "How their argument challenges",
  "epistemology_challenging_voice_4": "Thinker name",
  "epistemology_challenging_voice_4_classic": "Work (Date)",
  "epistemology_challenging_voice_4_rationale": "How their argument challenges",
  "epistemology_challenging_voice_5": "Thinker name",
  "epistemology_challenging_voice_5_classic": "Work (Date)",
  "epistemology_challenging_voice_5_rationale": "How their argument challenges",
  "ethics_kindred_spirit_1": "Thinker name",
  "ethics_kindred_spirit_1_classic": "Work (Date)",
  "ethics_kindred_spirit_1_rationale": "How their argument resonates",
  "ethics_kindred_spirit_2": "Thinker name",
  "ethics_kindred_spirit_2_classic": "Work (Date)",
  "ethics_kindred_spirit_2_rationale": "How their argument resonates",
  "ethics_kindred_spirit_3": "Thinker name",
  "ethics_kindred_spirit_3_classic": "Work (Date)",
  "ethics_kindred_spirit_3_rationale": "How their argument resonates",
  "ethics_kindred_spirit_4": "Thinker name",
  "ethics_kindred_spirit_4_classic": "Work (Date)",
  "ethics_kindred_spirit_4_rationale": "How their argument resonates",
  "ethics_kindred_spirit_5": "Thinker name",
  "ethics_kindred_spirit_5_classic": "Work (Date)",
  "ethics_kindred_spirit_5_rationale": "How their argument resonates",
  "ethics_challenging_voice_1": "Thinker name",
  "ethics_challenging_voice_1_classic": "Work (Date)",
  "ethics_challenging_voice_1_rationale": "How their argument challenges",
  "ethics_challenging_voice_2": "Thinker name",
  "ethics_challenging_voice_2_classic": "Work (Date)",
  "ethics_challenging_voice_2_rationale": "How their argument challenges",
  "ethics_challenging_voice_3": "Thinker name",
  "ethics_challenging_voice_3_classic": "Work (Date)",
  "ethics_challenging_voice_3_rationale": "How their argument challenges",
  "ethics_challenging_voice_4": "Thinker name",
  "ethics_challenging_voice_4_classic": "Work (Date)",
  "ethics_challenging_voice_4_rationale": "How their argument challenges",
  "ethics_challenging_voice_5": "Thinker name",
  "ethics_challenging_voice_5_classic": "Work (Date)",
  "ethics_challenging_voice_5_rationale": "How their argument challenges"
}`,

    3: `For Section 3 (Politics & Aesthetics), provide a JSON object with these exact fields:

{
  "politics_introduction": "1-2 sentences capturing your characteristic approach to politics, written as 'In politics, you tend to...'",
  "aesthetics_introduction": "1-2 sentences capturing your characteristic approach to aesthetics, written as 'In aesthetics, you tend to...'",
  "politics_kindred_spirit_1": "Thinker name",
  "politics_kindred_spirit_1_classic": "Work (Date)",
  "politics_kindred_spirit_1_rationale": "How their argument resonates",
  "politics_kindred_spirit_2": "Thinker name",
  "politics_kindred_spirit_2_classic": "Work (Date)",
  "politics_kindred_spirit_2_rationale": "How their argument resonates",
  "politics_kindred_spirit_3": "Thinker name",
  "politics_kindred_spirit_3_classic": "Work (Date)",
  "politics_kindred_spirit_3_rationale": "How their argument resonates",
  "politics_kindred_spirit_4": "Thinker name",
  "politics_kindred_spirit_4_classic": "Work (Date)",
  "politics_kindred_spirit_4_rationale": "How their argument resonates",
  "politics_kindred_spirit_5": "Thinker name",
  "politics_kindred_spirit_5_classic": "Work (Date)",
  "politics_kindred_spirit_5_rationale": "How their argument resonates",
  "politics_challenging_voice_1": "Thinker name",
  "politics_challenging_voice_1_classic": "Work (Date)",
  "politics_challenging_voice_1_rationale": "How their argument challenges",
  "politics_challenging_voice_2": "Thinker name",
  "politics_challenging_voice_2_classic": "Work (Date)",
  "politics_challenging_voice_2_rationale": "How their argument challenges",
  "politics_challenging_voice_3": "Thinker name",
  "politics_challenging_voice_3_classic": "Work (Date)",
  "politics_challenging_voice_3_rationale": "How their argument challenges",
  "politics_challenging_voice_4": "Thinker name",
  "politics_challenging_voice_4_classic": "Work (Date)",
  "politics_challenging_voice_4_rationale": "How their argument challenges",
  "politics_challenging_voice_5": "Thinker name",
  "politics_challenging_voice_5_classic": "Work (Date)",
  "politics_challenging_voice_5_rationale": "How their argument challenges",
  "aesthetics_kindred_spirit_1": "Thinker name",
  "aesthetics_kindred_spirit_1_classic": "Work (Date)",
  "aesthetics_kindred_spirit_1_rationale": "How their argument resonates",
  "aesthetics_kindred_spirit_2": "Thinker name",
  "aesthetics_kindred_spirit_2_classic": "Work (Date)",
  "aesthetics_kindred_spirit_2_rationale": "How their argument resonates",
  "aesthetics_kindred_spirit_3": "Thinker name",
  "aesthetics_kindred_spirit_3_classic": "Work (Date)",
  "aesthetics_kindred_spirit_3_rationale": "How their argument resonates",
  "aesthetics_kindred_spirit_4": "Thinker name",
  "aesthetics_kindred_spirit_4_classic": "Work (Date)",
  "aesthetics_kindred_spirit_4_rationale": "How their argument resonates",
  "aesthetics_kindred_spirit_5": "Thinker name",
  "aesthetics_kindred_spirit_5_classic": "Work (Date)",
  "aesthetics_kindred_spirit_5_rationale": "How their argument resonates",
  "aesthetics_challenging_voice_1": "Thinker name",
  "aesthetics_challenging_voice_1_classic": "Work (Date)",
  "aesthetics_challenging_voice_1_rationale": "How their argument challenges",
  "aesthetics_challenging_voice_2": "Thinker name",
  "aesthetics_challenging_voice_2_classic": "Work (Date)",
  "aesthetics_challenging_voice_2_rationale": "How their argument challenges",
  "aesthetics_challenging_voice_3": "Thinker name",
  "aesthetics_challenging_voice_3_classic": "Work (Date)",
  "aesthetics_challenging_voice_3_rationale": "How their argument challenges",
  "aesthetics_challenging_voice_4": "Thinker name",
  "aesthetics_challenging_voice_4_classic": "Work (Date)",
  "aesthetics_challenging_voice_4_rationale": "How their argument challenges",
  "aesthetics_challenging_voice_5": "Thinker name",
  "aesthetics_challenging_voice_5_classic": "Work (Date)",
  "aesthetics_challenging_voice_5_rationale": "How their argument challenges",
  "conclusion": "Brief synthesis of overall philosophical profile",
  "next_steps": "Practical suggestions for development"
}`
  };

  return `${basePrompt}\n\n${templates[section as keyof typeof templates]}`;
}
