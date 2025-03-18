export function getPromptForSection(section: number, answers_json: string): string {
  const parsedAnswers = JSON.parse(answers_json);

  switch (section) {
    case 1:
      return `
Based on the following survey responses, provide a philosophical profile covering theology, epistemology, ethics, politics, and aesthetics. Return ONLY a structured JSON object with no additional text or formatting.

The survey responses:
${JSON.stringify(parsedAnswers, null, 2)}

Return a JSON object with the following structure. Include ALL fields exactly as specified:

{
  "theology_summary": "A paragraph summarizing the user's theological stance...",
  "theology_quote": "A short memorable quote about the user's theology...",
  "theology_snapshot": "A concise 1-paragraph summary of their theology...",
  "theology_canon": "3-5 texts that would form their theological canon...",
  "theology_foundation": "The foundational belief of their theology...",
  "theology_anthropology": "Their view on human nature from a theological perspective...",
  "theology_classic": "Where they fit in classic theological taxonomies...",
  "theology_contemporary": "Where they fit in contemporary theological taxonomies...",
  "theology_heresy": "The 'heresy' they're most susceptible to...",
  "theology_trajectory": "The natural theological trajectory of their beliefs...",
  
  "epistemology_summary": "A paragraph summarizing the user's epistemological stance...",
  "epistemology_quote": "A short memorable quote about the user's epistemology...",
  "epistemology_snapshot": "A concise 1-paragraph summary of their epistemology...",
  "epistemology_canon": "3-5 texts that would form their epistemological canon...",
  "epistemology_foundation": "The foundational belief of their epistemology...",
  "epistemology_knowledge_source": "Their primary trusted source of knowledge...",
  "epistemology_classic": "Where they fit in classic epistemological taxonomies...",
  "epistemology_contemporary": "Where they fit in contemporary epistemological taxonomies...",
  "epistemology_blindspot": "Their epistemological blindspot...",
  "epistemology_trajectory": "The natural epistemological trajectory of their beliefs...",
  
  "ethics_summary": "A paragraph summarizing the user's ethical stance...",
  "ethics_quote": "A short memorable quote about the user's ethics...",
  "ethics_snapshot": "A concise 1-paragraph summary of their ethics...",
  "ethics_canon": "3-5 texts that would form their ethical canon...",
  "ethics_foundation": "The foundational belief of their ethics...",
  "ethics_value": "What they value most in ethical decisions...",
  "ethics_classic": "Where they fit in classic ethical taxonomies...",
  "ethics_contemporary": "Where they fit in contemporary ethical taxonomies...",
  "ethics_temptation": "The ethical temptation they're most susceptible to...",
  "ethics_trajectory": "The natural ethical trajectory of their beliefs...",
  
  "politics_summary": "A paragraph summarizing the user's political stance...",
  "politics_quote": "A short memorable quote about the user's politics...",
  "politics_snapshot": "A concise 1-paragraph summary of their politics...",
  "politics_canon": "3-5 texts that would form their political canon...",
  "politics_foundation": "The foundational belief of their politics...",
  "politics_value": "What they value most in political decisions...",
  "politics_classic": "Where they fit in classic political taxonomies...",
  "politics_contemporary": "Where they fit in contemporary political taxonomies...",
  "politics_blindspot": "Their political blindspot...",
  "politics_trajectory": "The natural political trajectory of their beliefs...",

  "aesthetics_summary": "A paragraph summarizing the user's aesthetic stance...",
  "aesthetics_quote": "A short memorable quote about the user's aesthetics...",
  "aesthetics_snapshot": "A concise 1-paragraph summary of their aesthetics...",
  "aesthetics_canon": "3-5 texts or works that would form their aesthetic canon...",
  "aesthetics_foundation": "The foundational belief of their aesthetics...",
  "aesthetics_beauty": "Their definition of beauty...",
  "aesthetics_classic": "Where they fit in classic aesthetic taxonomies...",
  "aesthetics_contemporary": "Where they fit in contemporary aesthetic taxonomies...",
  "aesthetics_blindspot": "Their aesthetic blindspot...",
  "aesthetics_trajectory": "The natural aesthetic trajectory of their beliefs..."
}

The response should contain only the JSON object with ALL fields filled in, no more and no less, following exactly the template provided.
`;
    case 2:
      return `
Based on the survey responses, identify intellectual kindred spirits and challenging voices in theology, epistemology, ethics, and politics. Return ONLY a structured JSON object with no additional text or formatting.

The survey responses:
${JSON.stringify(parsedAnswers, null, 2)}

Return a JSON object with the following structure. Include ALL fields exactly as specified:

{
  "theology_kindred_spirit_1": "Name of first theological kindred spirit",
  "theology_kindred_spirit_1_classic": "Time period and tradition (e.g., 'Medieval Christian (1225)')",
  "theology_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_2": "Name of second theological kindred spirit",
  "theology_kindred_spirit_2_classic": "Time period and tradition (e.g., 'Modern Jewish (1905)')",
  "theology_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_3": "Name of third theological kindred spirit",
  "theology_kindred_spirit_3_classic": "Time period and tradition",
  "theology_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_4": "Name of fourth theological kindred spirit",
  "theology_kindred_spirit_4_classic": "Time period and tradition",
  "theology_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_5": "Name of fifth theological kindred spirit",
  "theology_kindred_spirit_5_classic": "Time period and tradition",
  "theology_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_challenging_voice_1": "Name of first theological challenging voice",
  "theology_challenging_voice_1_classic": "Time period and tradition (e.g., 'Ancient Greek (380 BCE)')",
  "theology_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_2": "Name of second theological challenging voice",
  "theology_challenging_voice_2_classic": "Time period and tradition",
  "theology_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_3": "Name of third theological challenging voice",
  "theology_challenging_voice_3_classic": "Time period and tradition",
  "theology_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_4": "Name of fourth theological challenging voice",
  "theology_challenging_voice_4_classic": "Time period and tradition",
  "theology_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_5": "Name of fifth theological challenging voice",
  "theology_challenging_voice_5_classic": "Time period and tradition",
  "theology_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "epistemology_kindred_spirit_1": "Name of first epistemological kindred spirit",
  "epistemology_kindred_spirit_1_classic": "Time period and tradition",
  "epistemology_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_2": "Name of second epistemological kindred spirit",
  "epistemology_kindred_spirit_2_classic": "Time period and tradition",
  "epistemology_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_3": "Name of third epistemological kindred spirit",
  "epistemology_kindred_spirit_3_classic": "Time period and tradition",
  "epistemology_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_4": "Name of fourth epistemological kindred spirit",
  "epistemology_kindred_spirit_4_classic": "Time period and tradition",
  "epistemology_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_5": "Name of fifth epistemological kindred spirit",
  "epistemology_kindred_spirit_5_classic": "Time period and tradition",
  "epistemology_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_challenging_voice_1": "Name of first epistemological challenging voice",
  "epistemology_challenging_voice_1_classic": "Time period and tradition",
  "epistemology_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_2": "Name of second epistemological challenging voice",
  "epistemology_challenging_voice_2_classic": "Time period and tradition",
  "epistemology_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_3": "Name of third epistemological challenging voice",
  "epistemology_challenging_voice_3_classic": "Time period and tradition",
  "epistemology_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_4": "Name of fourth epistemological challenging voice",
  "epistemology_challenging_voice_4_classic": "Time period and tradition",
  "epistemology_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_5": "Name of fifth epistemological challenging voice",
  "epistemology_challenging_voice_5_classic": "Time period and tradition",
  "epistemology_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "ethics_kindred_spirit_1": "Name of first ethical kindred spirit",
  "ethics_kindred_spirit_1_classic": "Time period and tradition",
  "ethics_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_2": "Name of second ethical kindred spirit",
  "ethics_kindred_spirit_2_classic": "Time period and tradition",
  "ethics_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_3": "Name of third ethical kindred spirit",
  "ethics_kindred_spirit_3_classic": "Time period and tradition",
  "ethics_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_4": "Name of fourth ethical kindred spirit",
  "ethics_kindred_spirit_4_classic": "Time period and tradition",
  "ethics_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_5": "Name of fifth ethical kindred spirit",
  "ethics_kindred_spirit_5_classic": "Time period and tradition",
  "ethics_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_challenging_voice_1": "Name of first ethical challenging voice",
  "ethics_challenging_voice_1_classic": "Time period and tradition",
  "ethics_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_2": "Name of second ethical challenging voice",
  "ethics_challenging_voice_2_classic": "Time period and tradition",
  "ethics_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_3": "Name of third ethical challenging voice",
  "ethics_challenging_voice_3_classic": "Time period and tradition",
  "ethics_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_4": "Name of fourth ethical challenging voice",
  "ethics_challenging_voice_4_classic": "Time period and tradition",
  "ethics_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_5": "Name of fifth ethical challenging voice",
  "ethics_challenging_voice_5_classic": "Time period and tradition",
  "ethics_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "politics_kindred_spirit_1": "Name of first political kindred spirit",
  "politics_kindred_spirit_1_classic": "Time period and tradition",
  "politics_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_2": "Name of second political kindred spirit",
  "politics_kindred_spirit_2_classic": "Time period and tradition",
  "politics_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_3": "Name of third political kindred spirit",
  "politics_kindred_spirit_3_classic": "Time period and tradition",
  "politics_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_4": "Name of fourth political kindred spirit",
  "politics_kindred_spirit_4_classic": "Time period and tradition",
  "politics_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_5": "Name of fifth political kindred spirit",
  "politics_kindred_spirit_5_classic": "Time period and tradition",
  "politics_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_challenging_voice_1": "Name of first political challenging voice",
  "politics_challenging_voice_1_classic": "Time period and tradition",
  "politics_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's politics",
  
  "politics_challenging_voice_2": "Name of second political challenging voice",
  "politics_challenging_voice_2_classic": "Time period and tradition",
  "politics_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's politics",
  
  "politics_challenging_voice_3": "Name of third political challenging voice",
  "politics_challenging_voice_3_classic": "Time period and tradition",
  "politics_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's politics",
  
  "politics_challenging_voice_4": "Name of fourth political challenging voice",
  "politics_challenging_voice_4_classic": "Time period and tradition",
  "politics_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's politics",
  
  "politics_challenging_voice_5": "Name of fifth political challenging voice",
  "politics_challenging_voice_5_classic": "Time period and tradition",
  "politics_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's politics"
}

The response should contain only the JSON object with ALL fields filled in, no more and no less, following exactly the template provided.
`;
    case 3:
      return `
Based on the survey responses, determine the user's aesthetic preferences and suggest relevant reading material. Return ONLY a structured JSON object with no additional text or formatting.

The survey responses:
${JSON.stringify(parsedAnswers, null, 2)}

Return a JSON object with the following structure. Include ALL fields exactly as specified:

{
  "aesthetic_preferences": "A detailed paragraph on their aesthetic preferences across different mediums...",
  "musical_taste": "A description of the type of music they likely enjoy...",
  "literary_taste": "The kinds of books and literature they likely enjoy...",
  "visual_taste": "Their preferences in visual arts, architecture, and design...",
  "humor_taste": "The type of humor they likely appreciate...",
  "film_taste": "The genres and styles of films they likely enjoy...",
  "recreational_activities": "Leisure activities that would align with their philosophical outlook...",
  "aesthetic_practices": "Daily aesthetic practices or rituals they might value...",
  
  "recommended_reading_list": "At least 10 books they would find intellectually stimulating...",
  "recommended_arts_list": "At least 7 artistic works they would appreciate...",
  "recommended_practices_list": "At least 5 practices or habits that would align with their philosophical outlook..."
}

The response should contain only the JSON object with ALL fields filled in, no more and no less, following exactly the template provided.
`;
    default:
      return "Invalid section number";
  }
}

// New function to generate a combined prompt for all sections
export function getCombinedPrompt(answers_json: string): string {
  const parsedAnswers = JSON.parse(answers_json);
  
  // Create a comprehensive template that merges all sections
  return `
Based on the following survey responses, provide a comprehensive philosophical analysis covering theology, epistemology, ethics, politics, and aesthetics. Return ONLY a structured JSON object with ALL fields from all sections with no additional text or formatting.

The survey responses:
${JSON.stringify(parsedAnswers, null, 2)}

Return a single JSON object with the following structure. Include ALL fields exactly as specified:

{
  ### SECTION 1: Primary Analysis Fields ###
  "theology_summary": "A paragraph summarizing the user's theological stance...",
  "theology_quote": "A short memorable quote about the user's theology...",
  "theology_snapshot": "A concise 1-paragraph summary of their theology...",
  "theology_canon": "3-5 texts that would form their theological canon...",
  "theology_foundation": "The foundational belief of their theology...",
  "theology_anthropology": "Their view on human nature from a theological perspective...",
  "theology_classic": "Where they fit in classic theological taxonomies...",
  "theology_contemporary": "Where they fit in contemporary theological taxonomies...",
  "theology_heresy": "The 'heresy' they're most susceptible to...",
  "theology_trajectory": "The natural theological trajectory of their beliefs...",
  
  "epistemology_summary": "A paragraph summarizing the user's epistemological stance...",
  "epistemology_quote": "A short memorable quote about the user's epistemology...",
  "epistemology_snapshot": "A concise 1-paragraph summary of their epistemology...",
  "epistemology_canon": "3-5 texts that would form their epistemological canon...",
  "epistemology_foundation": "The foundational belief of their epistemology...",
  "epistemology_knowledge_source": "Their primary trusted source of knowledge...",
  "epistemology_classic": "Where they fit in classic epistemological taxonomies...",
  "epistemology_contemporary": "Where they fit in contemporary epistemological taxonomies...",
  "epistemology_blindspot": "Their epistemological blindspot...",
  "epistemology_trajectory": "The natural epistemological trajectory of their beliefs...",
  
  "ethics_summary": "A paragraph summarizing the user's ethical stance...",
  "ethics_quote": "A short memorable quote about the user's ethics...",
  "ethics_snapshot": "A concise 1-paragraph summary of their ethics...",
  "ethics_canon": "3-5 texts that would form their ethical canon...",
  "ethics_foundation": "The foundational belief of their ethics...",
  "ethics_value": "What they value most in ethical decisions...",
  "ethics_classic": "Where they fit in classic ethical taxonomies...",
  "ethics_contemporary": "Where they fit in contemporary ethical taxonomies...",
  "ethics_temptation": "The ethical temptation they're most susceptible to...",
  "ethics_trajectory": "The natural ethical trajectory of their beliefs...",
  
  "politics_summary": "A paragraph summarizing the user's political stance...",
  "politics_quote": "A short memorable quote about the user's politics...",
  "politics_snapshot": "A concise 1-paragraph summary of their politics...",
  "politics_canon": "3-5 texts that would form their political canon...",
  "politics_foundation": "The foundational belief of their politics...",
  "politics_value": "What they value most in political decisions...",
  "politics_classic": "Where they fit in classic political taxonomies...",
  "politics_contemporary": "Where they fit in contemporary political taxonomies...",
  "politics_blindspot": "Their political blindspot...",
  "politics_trajectory": "The natural political trajectory of their beliefs...",

  "aesthetics_summary": "A paragraph summarizing the user's aesthetic stance...",
  "aesthetics_quote": "A short memorable quote about the user's aesthetics...",
  "aesthetics_snapshot": "A concise 1-paragraph summary of their aesthetics...",
  "aesthetics_canon": "3-5 texts or works that would form their aesthetic canon...",
  "aesthetics_foundation": "The foundational belief of their aesthetics...",
  "aesthetics_beauty": "Their definition of beauty...",
  "aesthetics_classic": "Where they fit in classic aesthetic taxonomies...",
  "aesthetics_contemporary": "Where they fit in contemporary aesthetic taxonomies...",
  "aesthetics_blindspot": "Their aesthetic blindspot...",
  "aesthetics_trajectory": "The natural aesthetic trajectory of their beliefs...",

  ### SECTION 2: Intellectual Kindred Spirits and Challenging Voices ###
  
  "theology_kindred_spirit_1": "Name of first theological kindred spirit",
  "theology_kindred_spirit_1_classic": "Time period and tradition (e.g., 'Medieval Christian (1225)')",
  "theology_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_2": "Name of second theological kindred spirit",
  "theology_kindred_spirit_2_classic": "Time period and tradition (e.g., 'Modern Jewish (1905)')",
  "theology_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_3": "Name of third theological kindred spirit",
  "theology_kindred_spirit_3_classic": "Time period and tradition",
  "theology_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_4": "Name of fourth theological kindred spirit",
  "theology_kindred_spirit_4_classic": "Time period and tradition",
  "theology_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_kindred_spirit_5": "Name of fifth theological kindred spirit",
  "theology_kindred_spirit_5_classic": "Time period and tradition",
  "theology_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's theology",
  
  "theology_challenging_voice_1": "Name of first theological challenging voice",
  "theology_challenging_voice_1_classic": "Time period and tradition (e.g., 'Ancient Greek (380 BCE)')",
  "theology_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_2": "Name of second theological challenging voice",
  "theology_challenging_voice_2_classic": "Time period and tradition",
  "theology_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_3": "Name of third theological challenging voice",
  "theology_challenging_voice_3_classic": "Time period and tradition",
  "theology_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_4": "Name of fourth theological challenging voice",
  "theology_challenging_voice_4_classic": "Time period and tradition",
  "theology_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "theology_challenging_voice_5": "Name of fifth theological challenging voice",
  "theology_challenging_voice_5_classic": "Time period and tradition",
  "theology_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's theology",
  
  "epistemology_kindred_spirit_1": "Name of first epistemological kindred spirit",
  "epistemology_kindred_spirit_1_classic": "Time period and tradition",
  "epistemology_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_2": "Name of second epistemological kindred spirit",
  "epistemology_kindred_spirit_2_classic": "Time period and tradition",
  "epistemology_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_3": "Name of third epistemological kindred spirit",
  "epistemology_kindred_spirit_3_classic": "Time period and tradition",
  "epistemology_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_4": "Name of fourth epistemological kindred spirit",
  "epistemology_kindred_spirit_4_classic": "Time period and tradition",
  "epistemology_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_kindred_spirit_5": "Name of fifth epistemological kindred spirit",
  "epistemology_kindred_spirit_5_classic": "Time period and tradition",
  "epistemology_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's epistemology",
  
  "epistemology_challenging_voice_1": "Name of first epistemological challenging voice",
  "epistemology_challenging_voice_1_classic": "Time period and tradition",
  "epistemology_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_2": "Name of second epistemological challenging voice",
  "epistemology_challenging_voice_2_classic": "Time period and tradition",
  "epistemology_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_3": "Name of third epistemological challenging voice",
  "epistemology_challenging_voice_3_classic": "Time period and tradition",
  "epistemology_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_4": "Name of fourth epistemological challenging voice",
  "epistemology_challenging_voice_4_classic": "Time period and tradition",
  "epistemology_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "epistemology_challenging_voice_5": "Name of fifth epistemological challenging voice",
  "epistemology_challenging_voice_5_classic": "Time period and tradition",
  "epistemology_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's epistemology",
  
  "ethics_kindred_spirit_1": "Name of first ethical kindred spirit",
  "ethics_kindred_spirit_1_classic": "Time period and tradition",
  "ethics_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_2": "Name of second ethical kindred spirit",
  "ethics_kindred_spirit_2_classic": "Time period and tradition",
  "ethics_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_3": "Name of third ethical kindred spirit",
  "ethics_kindred_spirit_3_classic": "Time period and tradition",
  "ethics_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_4": "Name of fourth ethical kindred spirit",
  "ethics_kindred_spirit_4_classic": "Time period and tradition",
  "ethics_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_kindred_spirit_5": "Name of fifth ethical kindred spirit",
  "ethics_kindred_spirit_5_classic": "Time period and tradition",
  "ethics_kindred_spirit_5_rationale": "Paragraph explaining why this thinker resonates with the person's ethics",
  
  "ethics_challenging_voice_1": "Name of first ethical challenging voice",
  "ethics_challenging_voice_1_classic": "Time period and tradition",
  "ethics_challenging_voice_1_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_2": "Name of second ethical challenging voice",
  "ethics_challenging_voice_2_classic": "Time period and tradition",
  "ethics_challenging_voice_2_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_3": "Name of third ethical challenging voice",
  "ethics_challenging_voice_3_classic": "Time period and tradition",
  "ethics_challenging_voice_3_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_4": "Name of fourth ethical challenging voice",
  "ethics_challenging_voice_4_classic": "Time period and tradition",
  "ethics_challenging_voice_4_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "ethics_challenging_voice_5": "Name of fifth ethical challenging voice",
  "ethics_challenging_voice_5_classic": "Time period and tradition",
  "ethics_challenging_voice_5_rationale": "Paragraph explaining why this thinker would challenge the person's ethics",
  
  "politics_kindred_spirit_1": "Name of first political kindred spirit",
  "politics_kindred_spirit_1_classic": "Time period and tradition",
  "politics_kindred_spirit_1_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_2": "Name of second political kindred spirit",
  "politics_kindred_spirit_2_classic": "Time period and tradition",
  "politics_kindred_spirit_2_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_3": "Name of third political kindred spirit",
  "politics_kindred_spirit_3_classic": "Time period and tradition",
  "politics_kindred_spirit_3_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_4": "Name of fourth political kindred spirit",
  "politics_kindred_spirit_4_classic": "Time period and tradition",
  "politics_kindred_spirit_4_rationale": "Paragraph explaining why this thinker resonates with the person's politics",
  
  "politics_kindred_spirit_5": "Name of fifth political kindred spirit",
  "politics_kind
