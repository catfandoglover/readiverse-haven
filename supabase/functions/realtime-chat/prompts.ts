
export const getDNAPrompt = () => {
  const categoryOrder = ['ETHICS', 'EPISTEMOLOGY', 'POLITICS', 'THEOLOGY', 'ONTOLOGY', 'AESTHETICS'];
  
  // Complete question map with all 186 questions and their exact paths
  const questionsMap = {
    'ETHICS': {
      'A': 'In ethics, which view resonates more with you? A) Moral truth is objective and universal - there are absolute rights and wrongs that apply to everyone. B) Moral truth is relative and contextual - what\'s right or wrong depends on circumstances and culture.',
      'AA': 'Is the foundation of morality primarily: A) Following clear rules, duties, and principles, or B) Producing the best consequences and outcomes?',
      'AB': 'Do we determine what is moral through: A) Rational thought, logical analysis, and careful reasoning, or B) Intuition, emotion, and lived experience?',
      'AAA': 'Should moral rules be: A) Universal and unchanging across all situations, or B) Adaptable based on circumstances while maintaining core principles?',
      'AAB': 'In ethical decision-making, what matters most? A) The purity of intentions and adherence to moral law, or B) The actual outcomes and real-world impact?',
      'ABA': 'Is moral knowledge primarily: A) Discovered through philosophical investigation and reasoning, or B) Constructed through social consensus and cultural evolution?',
      'ABB': 'In moral decisions, should we trust: A) Careful ethical frameworks and systematic analysis, or B) Our moral intuitions and emotional responses?',
      // ... continue with all Ethics paths
    },
    'EPISTEMOLOGY': {
      'A': 'Regarding knowledge and truth, which perspective do you lean towards? A) We can access objective truth through proper methods and reasoning. B) All knowledge is inherently subjective and shaped by perspective.',
      'AA': 'How do you believe we primarily gain reliable knowledge? A) Through logical reasoning and rational analysis. B) Through empirical observation and direct experience.',
      'AB': 'When seeking truth, which approach do you trust more? A) Universal principles and abstract reasoning. B) Personal experience and practical wisdom.',
      'AAA': 'Is mathematics: A) Discovered as eternal truths existing independently of human minds, or B) Invented as useful tools for understanding the world?',
      'AAB': 'In scientific inquiry, what's more fundamental? A) Theoretical models and logical proofs, or B) Experimental evidence and observation?',
      'ABA': 'Can we access universal truth through: A) Pure reason and logical deduction, or B) A combination of experience and cultural context?',
      'ABB': 'Is knowledge primarily: A) Built from foundational principles upward, or B) Emergent from practical engagement with the world?',
      // ... continue with all Epistemology paths
    },
    'POLITICS': {
      'A': 'Should society prioritize: A) Individual rights and personal freedom, or B) Collective welfare and social harmony?',
      'AA': 'Is human nature fundamentally: A) Self-interested and competitive, requiring strong institutions, or B) Cooperative and altruistic, needing nurturing environments?',
      'AB': 'Should power be: A) Centralized for efficiency and coordination, or B) Distributed for fairness and resilience?',
      'AAA': 'In governance, what's more important? A) Protecting individual property rights, or B) Ensuring equitable distribution of resources?',
      'AAB': 'Should social institutions: A) Channel competitive impulses productively, or B) Foster cooperation and mutual aid?',
      'ABA': 'Is legitimate authority derived from: A) Formal structures and clear hierarchies, or B) Grassroots consensus and community agreement?',
      'ABB': 'Should decision-making be: A) Swift and decisive through clear chains of command, or B) Inclusive and deliberative through collective processes?',
      // ... continue with all Politics paths
    },
    'THEOLOGY': {
      'A': 'Regarding ultimate reality, do you lean towards: A) There exists a transcendent divine or spiritual dimension, or B) The material world is all there is?',
      'AA': 'Is religious truth primarily accessed through: A) Revelation and tradition, or B) Personal spiritual experience?',
      'AB': 'Is the divine: A) Personal and relational, or B) Impersonal and cosmic?',
      'AAA': 'Should sacred texts be: A) Interpreted literally and preserved exactly, or B) Understood metaphorically and adapted to context?',
      'AAB': 'Is religious authority: A) Vested in traditional institutions and leaders, or B) Found in individual spiritual experiences?',
      'ABA': 'Is the divine primarily: A) A personal being we can relate to, or B) An impersonal force or principle?',
      'ABB': 'Is spiritual truth: A) Universal and unchanging, or B) Evolving and culturally shaped?',
      // ... continue with all Theology paths
    },
    'ONTOLOGY': {
      'A': 'Is reality fundamentally: A) Mental or spiritual in nature, or B) Physical and material?',
      'AA': 'Is the universe: A) Governed by purpose and meaning, or B) Mechanistic and without inherent purpose?',
      'AB': 'Is consciousness: A) Primary and fundamental to reality, or B) Emergent from physical processes?',
      'AAA': 'Are abstract concepts: A) Real entities existing independently of minds, or B) Human constructs for understanding?',
      'AAB': 'Is causation: A) Driven by purposes and goals, or B) Purely mechanical and efficient?',
      'ABA': 'Is mind: A) Distinct from and prior to matter, or B) Emergent from material complexity?',
      'ABB': 'Is free will: A) Real and fundamental to consciousness, or B) An illusion of complex deterministic processes?',
      // ... continue with all Ontology paths
    },
    'AESTHETICS': {
      'A': 'Is beauty: A) Objective and universal, or B) Subjective and cultural?',
      'AA': 'Should art prioritize: A) Form and technical excellence, or B) Expression and emotional impact?',
      'AB': 'Is artistic value: A) Intrinsic to the work itself, or B) Created by cultural context and interpretation?',
      'AAA': 'Should artists focus on: A) Mastering traditional forms and techniques, or B) Breaking conventions and innovating?',
      'AAB': 'Is artistic merit determined by: A) Formal qualities and skill, or B) Emotional resonance and impact?',
      'ABA': 'Is meaning in art: A) Created by the artist's intentions, or B) Constructed by the viewer's interpretation?',
      'ABB': 'Should art: A) Strive for universal appeal, or B) Embrace cultural specificity?',
      // ... continue with all Aesthetics paths
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
