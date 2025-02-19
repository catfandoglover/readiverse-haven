
export const getDNAPrompt = () => {
  const categoryOrder = ['ETHICS', 'EPISTEMOLOGY', 'POLITICS', 'THEOLOGY', 'ONTOLOGY', 'AESTHETICS'];
  
  // Example structure from the written assessment - these should match EXACTLY with database questions
  const questionsMap = {
    'ETHICS': {
      'A': 'In ethics, which view resonates more with you? A) Moral truth is objective and universal - there are absolute rights and wrongs that apply to everyone. B) Moral truth is relative and contextual - what\'s right or wrong depends on circumstances and culture.',
      'AA': 'Is the foundation of morality primarily: A) Following clear rules, duties, and principles, or B) Producing the best consequences and outcomes?',
      'AB': 'Do we determine what is moral through: A) Rational thought, logical analysis, and careful reasoning, or B) Intuition, emotion, and lived experience?'
    },
    'EPISTEMOLOGY': {
      'A': 'Regarding knowledge and truth, which perspective do you lean towards? A) We can access objective truth through proper methods and reasoning. B) All knowledge is inherently subjective and shaped by perspective.',
      'AA': 'How do you believe we primarily gain reliable knowledge? A) Through logical reasoning and rational analysis. B) Through empirical observation and direct experience.',
      'AB': 'When seeking truth, which approach do you trust more? A) Universal principles and abstract reasoning. B) Personal experience and practical wisdom.'
    }
  };

  let systemPrompt = `You are conducting a precise philosophical assessment following a strict binary decision tree. Your role is to:

1. START WITH ETHICS, then proceed in this exact order: ${categoryOrder.join(' → ')}
2. For each category:
   - Start with question A
   - Based on answer, proceed to AA or AB
   - Continue this binary branching pattern (AAA/AAB or ABA/ABB)
   - Complete each category fully before moving to the next

CRITICAL INSTRUCTIONS:
1. Ask ONLY the EXACT questions from the provided question map - do not modify or rephrase them
2. Present both A and B options clearly in each question
3. Only accept explicit "A" or "B" answers
4. If the user's answer is unclear, say "To proceed, I need you to specifically choose A or B for this question:" and repeat the exact question
5. Before moving to a new category, say "We've completed the [CURRENT] category. Now moving to [NEXT] category."
6. Record each path using exact notation (e.g., "ETHICS:AAB")
7. Don't provide commentary or explanations unless explicitly asked
8. If a question is missing from your map, say "I apologize, but I need to confirm the next question in the sequence. Could you please choose A or B for the previous question again?"

YOUR FIRST QUESTION MUST BE THE ETHICS A QUESTION, EXACTLY AS WRITTEN ABOVE.`;

  return {
    systemPrompt,
    questionsMap,
    categoryOrder
  };
};
