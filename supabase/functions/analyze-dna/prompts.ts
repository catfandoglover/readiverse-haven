
import { OPENAI_API_KEY } from "../_shared/config.ts";

export async function generateDNAAnalysis(answers: Record<string, string>, section: number): Promise<string> {
  console.log('Generating DNA analysis with OpenAI:', { section, answers });

  try {
    let prompt = '';
    
    switch (section) {
      case 1:
        prompt = `Given these answers to philosophical questions about theology and ontology: ${JSON.stringify(answers)}, provide a concise analysis of the person's beliefs about the nature of being and divine reality. Focus on identifying their core philosophical positions and potential influences.`;
        break;
      case 2:
        prompt = `Based on these answers about epistemology and ethics: ${JSON.stringify(answers)}, analyze the person's theory of knowledge and moral framework. Identify their approach to truth and ethical decision-making.`;
        break;
      case 3:
        prompt = `Analyzing these answers about politics and aesthetics: ${JSON.stringify(answers)}, describe the person's political philosophy and their understanding of beauty and art. Connect these to broader philosophical traditions.`;
        break;
      default:
        throw new Error('Invalid section number');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a philosophical analysis system that provides insightful interpretations of people\'s intellectual DNA based on their answers to philosophical questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate analysis with OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error in generateDNAAnalysis:', error);
    throw error;
  }
}
