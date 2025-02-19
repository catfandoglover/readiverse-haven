
export const getDNAPrompt = () => {
  const categoryOrder = ['ETHICS', 'EPISTEMOLOGY', 'POLITICS', 'THEOLOGY', 'ONTOLOGY', 'AESTHETICS'];
  
  // This is a static mapping of the decision tree that gets updated daily via cron
  const questionsMap = {
    'ETHICS': {
      'A': 'Do you believe that moral truths are absolute and universal, or relative and contextual?',
      'AA': 'Is morality fundamentally about following rules and duties, or about producing good consequences?',
      'AB': 'Are moral values discovered through reason and logic, or through emotion and intuition?',
      // Add more questions here when syncing
    },
    'EPISTEMOLOGY': {
      'A': 'Can we trust our senses to give us reliable information about reality?',
      'AA': 'Is knowledge primarily acquired through reason or through experience?',
      'AB': 'Do we have access to absolute truth, or is all knowledge relative to perspective?',
      // Add more questions here when syncing
    },
    'POLITICS': {
      'A': 'Should society prioritize individual liberty or collective wellbeing?',
      'AA': 'Is human nature fundamentally cooperative or competitive?',
      'AB': 'Should power be centralized or distributed?',
      // Add more questions here when syncing
    },
    'THEOLOGY': {
      'A': 'Is there a higher power or divine reality beyond the material world?',
      'AA': 'Is religious truth discovered through revelation or reason?',
      'AB': 'Does human life have an ultimate purpose or meaning?',
      // Add more questions here when syncing
    },
    'ONTOLOGY': {
      'A': 'Is reality fundamentally material or mental/spiritual in nature?',
      'AA': 'Is the universe deterministic or is there genuine free will?',
      'AB': 'Are abstract concepts real or just human constructs?',
      // Add more questions here when syncing
    },
    'AESTHETICS': {
      'A': 'Is beauty objective or subjective?',
      'AA': 'Should art prioritize form or function?',
      'AB': 'Does great art require technical skill or just creative vision?',
      // Add more questions here when syncing
    }
  };

  let systemPrompt = `You are conducting the DNA Assessment by following a precise decision tree structure in this exact order:\n\n`;

  categoryOrder.forEach((category, index) => {
    systemPrompt += `${index + 1}. ${category} Path (${index === 0 ? 'FIRST' : index === categoryOrder.length - 1 ? 'LAST' : `${index + 1}TH`}):
First question: "${questionsMap[category]['A']}"
Follow exact branching according to diagram, maintaining precise path notation.
A → AA/AB → AAA/AAB/ABA/ABB → AAAA/AAAB/AABA/AABB/etc.\n\n`;
  });

  systemPrompt += `CRITICAL RULES:
1. You MUST follow this exact order: ${categoryOrder.join(' → ')}
2. Never skip ahead or change the order of domains
3. Complete all questions in one domain before moving to the next
4. Ask ONLY the exact question text from the question map - no modifications
5. Record the exact path using the notation system (e.g., "${categoryOrder[0]}:AABAAB")
6. Only accept clear "A" or "B" answers
7. If answer is unclear, repeat the exact question with the A and B options
8. Do not provide additional context unless asked
9. Record each response in the exact sequence
10. Maintain precise question hierarchy within each domain`;

  return {
    systemPrompt,
    questionsMap,
    categoryOrder
  };
};
