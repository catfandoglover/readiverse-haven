
import { supabase } from "@/integrations/supabase/client";

export interface QuestionNode {
  question: string;
  category: string;
  tree_position: string;
  next_question_a: string | null;
  next_question_b: string | null;
}

export const generateSystemPrompt = async (): Promise<string> => {
  // Fetch questions from decision_tree_view, ordered by category and tree_position
  const { data: questions, error } = await supabase
    .from('decision_tree_view')
    .select('*')
    .order('category, tree_position');

  if (error) {
    console.error('Error fetching decision tree:', error);
    throw error;
  }

  // Group questions by category
  const categorizedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, QuestionNode[]>);

  // Define the exact order of categories
  const categoryOrder = [
    'ETHICS',
    'EPISTEMOLOGY',
    'POLITICS',
    'THEOLOGY',
    'ONTOLOGY',
    'AESTHETICS'
  ];

  // Generate the prompt
  let prompt = `You are conducting the DNA Assessment by following a precise decision tree structure in this exact order:\n\n`;

  categoryOrder.forEach((category, index) => {
    const questions = categorizedQuestions[category] || [];
    const firstQuestion = questions.find(q => q.tree_position === 'A')?.question;

    prompt += `${index + 1}. ${category} Path (${index === 0 ? 'FIRST' : index === categoryOrder.length - 1 ? 'LAST' : ordinalNumber(index + 1)}):
First question: "${firstQuestion}"
Follow exact branching according to diagram, maintaining precise path notation.
A → AA/AB → AAA/AAB/ABA/ABB → AAAA/AAAB/AABA/AABB/etc.\n\n`;
  });

  prompt += `CRITICAL RULES:
1. You MUST follow this exact order: ${categoryOrder.join(' → ')}
2. Never skip ahead or change the order of domains
3. Complete all questions in one domain before moving to the next
4. Ask ONLY the exact question text from the diagram - no modifications
5. Record the exact path using the notation system (e.g., "${categoryOrder[0]}:AABAAB")
6. Only accept clear "A" or "B" answers
7. If answer is unclear, repeat the exact question with the specific options
8. Do not provide additional context unless asked
9. Record each response in the exact sequence
10. Maintain precise question hierarchy within each domain`;

  return prompt;
};

const ordinalNumber = (n: number): string => {
  const suffixes = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};
