
export function getPromptForSection(section: number, answers_json: string): string {
  const basePrompt = `Important: Always write your response in the second person, addressing the subject directly as "you". For example, use phrases like "Your philosophical DNA...", "You tend to...", "Your approach is..."

Here are your answers to the philosophical questions:

<answers_json>
${answers_json}
</answers_json>`;

  const sectionPrompts = {
    1: getTheologyOntologyPrompt(),
    2: getEpistemologyEthicsPrompt(),
    3: getPoliticsAestheticsPrompt()
  };

  return `${basePrompt}\n\n${sectionPrompts[section as keyof typeof sectionPrompts]}`;
}

function getTheologyOntologyPrompt(): string {
  return `### **For Section 1 (Theology & Ontology)**

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
}

function getEpistemologyEthicsPrompt(): string {
  return `### **For Section 2 (Epistemology & Ethics)**

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
  <epistemology_kindred_spirit_2_rationale>[how their argument resonates with you]</epistemology_kindred_spirit_2_rationale>

  <epistemology_kindred_spirit_3>[Thinker]</epistemology_kindred_spirit_3>
  <epistemology_kindred_spirit_3_classic>[Work (Date)]</epistemology_kindred_spirit_3_classic>
  <epistemology_kindred_spirit_3_rationale>[how their argument resonates with you]</epistemology_kindred_spirit_3_rationale>

  <epistemology_kindred_spirit_4>[Thinker]</epistemology_kindred_spirit_4>
  <epistemology_kindred_spirit_4_classic>[Work (Date)]</epistemology_kindred_spirit_4_classic>
  <epistemology_kindred_spirit_4_rationale>[how their argument resonates with you]</epistemology_kindred_spirit_4_rationale>

  <epistemology_kindred_spirit_5>[Thinker]</epistemology_kindred_spirit_5>
  <epistemology_kindred_spirit_5_classic>[Work (Date)]</epistemology_kindred_spirit_5_classic>
  <epistemology_kindred_spirit_5_rationale>[how their argument resonates with you]</epistemology_kindred_spirit_5_rationale>

  <epistemology_challenging_voice_1>[Thinker]</epistemology_challenging_voice_1>
  <epistemology_challenging_voice_1_classic>[Work (Date)]</epistemology_challenging_voice_1_classic>
  <epistemology_challenging_voice_1_rationale>[how their argument challenges you]</epistemology_challenging_voice_1_rationale>

  <epistemology_challenging_voice_2>[Thinker]</epistemology_challenging_voice_2>
  <epistemology_challenging_voice_2_classic>[Work (Date)]</epistemology_challenging_voice_2_classic>
  <epistemology_challenging_voice_2_rationale>[how their argument challenges you]</epistemology_challenging_voice_2_rationale>

  <epistemology_challenging_voice_3>[Thinker]</epistemology_challenging_voice_3>
  <epistemology_challenging_voice_3_classic>[Work (Date)]</epistemology_challenging_voice_3_classic>
  <epistemology_challenging_voice_3_rationale>[how their argument challenges you]</epistemology_challenging_voice_3_rationale>

  <epistemology_challenging_voice_4>[Thinker]</epistemology_challenging_voice_4>
  <epistemology_challenging_voice_4_classic>[Work (Date)]</epistemology_challenging_voice_4_classic>
  <epistemology_challenging_voice_4_rationale>[how their argument challenges you]</epistemology_challenging_voice_4_rationale>

  <epistemology_challenging_voice_5>[Thinker]</epistemology_challenging_voice_5>
  <epistemology_challenging_voice_5_classic>[Work (Date)]</epistemology_challenging_voice_5_classic>
  <epistemology_challenging_voice_5_rationale>[how their argument challenges you]</epistemology_challenging_voice_5_rationale>

  <ethics_kindred_spirit_1>[Thinker]</ethics_kindred_spirit_1>
  <ethics_kindred_spirit_1_classic>[Work (Date)]</ethics_kindred_spirit_1_classic>
  <ethics_kindred_spirit_1_rationale>[how their argument resonates with you]</ethics_kindred_spirit_1_rationale>

  <ethics_kindred_spirit_2>[Thinker]</ethics_kindred_spirit_2>
  <ethics_kindred_spirit_2_classic>[Work (Date)]</ethics_kindred_spirit_2_classic>
  <ethics_kindred_spirit_2_rationale>[how their argument resonates with you]</ethics_kindred_spirit_2_rationale>

  <ethics_kindred_spirit_3>[Thinker]</ethics_kindred_spirit_3>
  <ethics_kindred_spirit_3_classic>[Work (Date)]</ethics_kindred_spirit_3_classic>
  <ethics_kindred_spirit_3_rationale>[how their argument resonates with you]</ethics_kindred_spirit_3_rationale>

  <ethics_kindred_spirit_4>[Thinker]</ethics_kindred_spirit_4>
  <ethics_kindred_spirit_4_classic>[Work (Date)]</ethics_kindred_spirit_4_classic>
  <ethics_kindred_spirit_4_rationale>[how their argument resonates with you]</ethics_kindred_spirit_4_rationale>

  <ethics_kindred_spirit_5>[Thinker]</ethics_kindred_spirit_5>
  <ethics_kindred_spirit_5_classic>[Work (Date)]</ethics_kindred_spirit_5_classic>
  <ethics_kindred_spirit_5_rationale>[how their argument resonates with you]</ethics_kindred_spirit_5_rationale>

  <ethics_challenging_voice_1>[Thinker]</ethics_challenging_voice_1>
  <ethics_challenging_voice_1_classic>[Work (Date)]</ethics_challenging_voice_1_classic>
  <ethics_challenging_voice_1_rationale>[how their argument challenges you]</ethics_challenging_voice_1_rationale>

  <ethics_challenging_voice_2>[Thinker]</ethics_challenging_voice_2>
  <ethics_challenging_voice_2_classic>[Work (Date)]</ethics_challenging_voice_2_classic>
  <ethics_challenging_voice_2_rationale>[how their argument challenges you]</ethics_challenging_voice_2_rationale>

  <ethics_challenging_voice_3>[Thinker]</ethics_challenging_voice_3>
  <ethics_challenging_voice_3_classic>[Work (Date)]</ethics_challenging_voice_3_classic>
  <ethics_challenging_voice_3_rationale>[how their argument challenges you]</ethics_challenging_voice_3_rationale>

  <ethics_challenging_voice_4>[Thinker]</ethics_challenging_voice_4>
  <ethics_challenging_voice_4_classic>[Work (Date)]</ethics_challenging_voice_4_classic>
  <ethics_challenging_voice_4_rationale>[how their argument challenges you]</ethics_challenging_voice_4_rationale>

  <ethics_challenging_voice_5>[Thinker]</ethics_challenging_voice_5>
  <ethics_challenging_voice_5_classic>[Work (Date)]</ethics_challenging_voice_5_classic>
  <ethics_challenging_voice_5_rationale>[how their argument challenges you]</ethics_challenging_voice_5_rationale>
</thinker_analysis>

</philosophical_profile>`;
}

function getPoliticsAestheticsPrompt(): string {
  return `### **For Section 3 (Politics & Aesthetics)**

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
  <politics_kindred_spirit_1>[Thinker]</politics_kindred_spirit_1>
  <politics_kindred_spirit_1_classic>[Work (Date)]</politics_kindred_spirit_1_classic>
  <politics_kindred_spirit_1_rationale>[how their argument resonates with you]</politics_kindred_spirit_1_rationale>

  <politics_kindred_spirit_2>[Thinker]</politics_kindred_spirit_2>
  <politics_kindred_spirit_2_classic>[Work (Date)]</politics_kindred_spirit_2_classic>
  <politics_kindred_spirit_2_rationale>[how their argument resonates with you]</politics_kindred_spirit_2_rationale>

  <politics_kindred_spirit_3>[Thinker]</politics_kindred_spirit_3>
  <politics_kindred_spirit_3_classic>[Work (Date)]</politics_kindred_spirit_3_classic>
  <politics_kindred_spirit_3_rationale>[how their argument resonates with you]</politics_kindred_spirit_3_rationale>

  <politics_kindred_spirit_4>[Thinker]</politics_kindred_spirit_4>
  <politics_kindred_spirit_4_classic>[Work (Date)]</politics_kindred_spirit_4_classic>
  <politics_kindred_spirit_4_rationale>[how their argument resonates with you]</politics_kindred_spirit_4_rationale>

  <politics_kindred_spirit_5>[Thinker]</politics_kindred_spirit_5>
  <politics_kindred_spirit_5_classic>[Work (Date)]</politics_kindred_spirit_5_classic>
  <politics_kindred_spirit_5_rationale>[how their argument resonates with you]</politics_kindred_spirit_5_rationale>

  <politics_challenging_voice_1>[Thinker]</politics_challenging_voice_1>
  <politics_challenging_voice_1_classic>[Work (Date)]</politics_challenging_voice_1_classic>
  <politics_challenging_voice_1_rationale>[how their argument challenges you]</politics_challenging_voice_1_rationale>

  <politics_challenging_voice_2>[Thinker]</politics_challenging_voice_2>
  <politics_challenging_voice_2_classic>[Work (Date)]</politics_challenging_voice_2_classic>
  <politics_challenging_voice_2_rationale>[how their argument challenges you]</politics_challenging_voice_2_rationale>

  <politics_challenging_voice_3>[Thinker]</politics_challenging_voice_3>
  <politics_challenging_voice_3_classic>[Work (Date)]</politics_challenging_voice_3_classic>
  <politics_challenging_voice_3_rationale>[how their argument challenges you]</politics_challenging_voice_3_rationale>

  <politics_challenging_voice_4>[Thinker]</politics_challenging_voice_4>
  <politics_challenging_voice_4_classic>[Work (Date)]</politics_challenging_voice_4_classic>
  <politics_challenging_voice_4_rationale>[how their argument challenges you]</politics_challenging_voice_4_rationale>

  <politics_challenging_voice_5>[Thinker]</politics_challenging_voice_5>
  <politics_challenging_voice_5_classic>[Work (Date)]</politics_challenging_voice_5_classic>
  <politics_challenging_voice_5_rationale>[how their argument challenges you]</politics_challenging_voice_5_rationale>

  <aesthetics_kindred_spirit_1>[Thinker]</aesthetics_kindred_spirit_1>
  <aesthetics_kindred_spirit_1_classic>[Work (Date)]</aesthetics_kindred_spirit_1_classic>
  <aesthetics_kindred_spirit_1_rationale>[how their argument resonates with you]</aesthetics_kindred_spirit_1_rationale>

  <aesthetics_kindred_spirit_2>[Thinker]</aesthetics_kindred_spirit_2>
  <aesthetics_kindred_spirit_2_classic>[Work (Date)]</aesthetics_kindred_spirit_2_classic>
  <aesthetics_kindred_spirit_2_rationale>[how their argument resonates with you]</aesthetics_kindred_spirit_2_rationale>

  <aesthetics_kindred_spirit_3>[Thinker]</aesthetics_kindred_spirit_3>
  <aesthetics_kindred_spirit_3_classic>[Work (Date)]</aesthetics_kindred_spirit_3_classic>
  <aesthetics_kindred_spirit_3_rationale>[how their argument resonates with you]</aesthetics_kindred_spirit_3_rationale>

  <aesthetics_kindred_spirit_4>[Thinker]</aesthetics_kindred_spirit_4>
  <aesthetics_kindred_spirit_4_classic>[Work (Date)]</aesthetics_kindred_spirit_4_classic>
  <aesthetics_kindred_spirit_4_rationale>[how their argument resonates with you]</aesthetics_kindred_spirit_4_rationale>

  <aesthetics_kindred_spirit_5>[Thinker]</aesthetics_kindred_spirit_5>
  <aesthetics_kindred_spirit_5_classic>[Work (Date)]</aesthetics_kindred_spirit_5_classic>
  <aesthetics_kindred_spirit_5_rationale>[how their argument resonates with you]</aesthetics_kindred_spirit_5_rationale>

  <aesthetics_challenging_voice_1>[Thinker]</aesthetics_challenging_voice_1>
  <aesthetics_challenging_voice_1_classic>[Work (Date)]</aesthetics_challenging_voice_1_classic>
  <aesthetics_challenging_voice_1_rationale>[how their argument challenges you]</aesthetics_challenging_voice_1_rationale>

  <aesthetics_challenging_voice_2>[Thinker]</aesthetics_challenging_voice_2>
  <aesthetics_challenging_voice_2_classic>[Work (Date)]</aesthetics_challenging_voice_2_classic>
  <aesthetics_challenging_voice_2_rationale>[how their argument challenges you]</aesthetics_challenging_voice_2_rationale>

  <aesthetics_challenging_voice_3>[Thinker]</aesthetics_challenging_voice_3>
  <aesthetics_challenging_voice_3_classic>[Work (Date)]</aesthetics_challenging_voice_3_classic>
  <aesthetics_challenging_voice_3_rationale>[how their argument challenges you]</aesthetics_challenging_voice_3_rationale>

  <aesthetics_challenging_voice_4>[Thinker]</aesthetics_challenging_voice_4>
  <aesthetics_challenging_voice_4_classic>[Work (Date)]</aesthetics_challenging_voice_4_classic>
  <aesthetics_challenging_voice_4_rationale>[how their argument challenges you]</aesthetics_challenging_voice_4_rationale>

  <aesthetics_challenging_voice_5>[Thinker]</aesthetics_challenging_voice_5>
  <aesthetics_challenging_voice_5_classic>[Work (Date)]</aesthetics_challenging_voice_5_classic>
  <aesthetics_challenging_voice_5_rationale>[how their argument challenges you]</aesthetics_challenging_voice_5_rationale>
</thinker_analysis>

<concluding_analysis>
<conclusion>[Brief synthesis of your overall philosophical profile, highlighting key themes and potential directions for your development.]</conclusion>
<next_steps>[Practical suggestions on how to refine and evolve your philosophical thinking.]</next_steps>
</concluding_analysis>

</philosophical_profile>`;
}
