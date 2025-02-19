
export const getPromptForSection = (section: number) => {
  switch (section) {
    case 1:
      return `You are analyzing a user's responses to philosophical questions about theology and ontology. Given their answers in JSON format, write a detailed analysis of their intellectual DNA for these domains.

Instructions:
1. Analyze both their theological and ontological positions
2. Look for patterns and contradictions
3. Relate their views to known philosophical frameworks
4. Keep focus on personal intellectual style, not judging correctness
5. Write in second person ("you" statements)
6. Be precise but accessible in language

Format your response as a JSON object with these fields:
{
  "theology_analysis": "2-3 paragraphs focusing on theological views",
  "ontology_analysis": "2-3 paragraphs on ontological positions",
  "dominant_frameworks": ["name major philosophical frameworks that align"],
  "key_tensions": ["list any notable internal contradictions"],
  "intellectual_style": "1 paragraph on their general approach to these domains"
}`;

    case 2:
      return `You are analyzing a user's responses to philosophical questions about epistemology and ethics. Given their answers in JSON format, write a detailed analysis of their intellectual DNA for these domains.

Instructions:
1. Analyze both their epistemological and ethical positions
2. Look for patterns and contradictions
3. Relate their views to known philosophical frameworks
4. Keep focus on personal intellectual style, not judging correctness
5. Write in second person ("you" statements)
6. Be precise but accessible in language

Format your response as a JSON object with these fields:
{
  "epistemology_analysis": "2-3 paragraphs on knowledge and truth views",
  "ethics_analysis": "2-3 paragraphs focusing on moral philosophy",
  "dominant_frameworks": ["name major philosophical frameworks that align"],
  "key_tensions": ["list any notable internal contradictions"],
  "intellectual_style": "1 paragraph on their general approach to these domains"
}`;

    case 3:
      return `You are analyzing a user's responses to philosophical questions about politics and aesthetics. Given their answers in JSON format, write a detailed analysis of their intellectual DNA for these domains.

Instructions:
1. Analyze both their political and aesthetic positions
2. Look for patterns and contradictions
3. Relate their views to known philosophical frameworks
4. Keep focus on personal intellectual style, not judging correctness
5. Write in second person ("you" statements)
6. Be precise but accessible in language

Format your response as a JSON object with these fields:
{
  "politics_analysis": "2-3 paragraphs on political philosophy",
  "aesthetics_analysis": "2-3 paragraphs focusing on views of beauty and art",
  "dominant_frameworks": ["name major philosophical frameworks that align"],
  "key_tensions": ["list any notable internal contradictions"],
  "intellectual_style": "1 paragraph on their general approach to these domains"
}`;

    default:
      throw new Error(`Invalid section number: ${section}`);
  }
};
