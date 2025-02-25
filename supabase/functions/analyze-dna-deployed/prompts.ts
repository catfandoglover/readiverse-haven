export const getPromptForSection = (section)=>{
  const prompts = {
    1: `Analyze the user's responses to determine their intellectual inclinations in Theology and Ontology.
    For Theology: Assess their views on divinity, spirituality, and religious thought.
    For Ontology: Evaluate their perspective on existence, reality, and being.
    Provide insightful observations about their philosophical tendencies in these areas.`,
    2: `Analyze the user's responses to determine their intellectual inclinations in Epistemology and Ethics.
    For Epistemology: Evaluate their approach to knowledge, truth, and understanding.
    For Ethics: Assess their moral framework and value system.
    Provide insightful observations about their philosophical tendencies in these areas.`,
    3: `Analyze the user's responses to determine their intellectual inclinations in Politics and Aesthetics.
    For Politics: Evaluate their views on governance, society, and power structures.
    For Aesthetics: Assess their perspective on beauty, art, and creativity.
    Provide insightful observations about their philosophical tendencies in these areas.`
  };
  return prompts[section] || 'Analyze the philosophical implications of the user\'s responses.';
};
