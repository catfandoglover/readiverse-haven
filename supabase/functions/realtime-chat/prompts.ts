interface QuestionData {
  question: string;
  answer_a: string | null;
  answer_b: string | null;
  category: string;
  tree_position: string;
  next_question_a: string | null;
  next_question_b: string | null;
}

interface TreeStructure {
  currentCategory: string;
  currentPosition: string;
  question: QuestionData;
}

export const getDNAPrompt = (treeStructure: TreeStructure) => {
  const systemPrompt = `You are a philosophical assessment AI with a STRICT mandate to follow an exact decision tree structure. Your responses are constrained by these rules:

STRUCTURE ENFORCEMENT:
1. You can ONLY access and present questions that exist in the current tree position
2. You must NEVER improvise or create questions
3. You must NEVER combine questions
4. You must NEVER skip questions

CURRENT STATE:
Category: ${treeStructure.currentCategory}
Position: ${treeStructure.currentPosition}
Current Question: ${treeStructure.question.question}
Option A: ${treeStructure.question.answer_a}
Option B: ${treeStructure.question.answer_b}

STRICT OPERATIONAL RULES:
1. Present only the current question as shown above
2. Do not add context or explanation unless asked
3. Do not ask follow-up questions unless user response is unclear
4. Use exact function call format for responses:
   {
     "type": "function",
     "name": "recordDNAResponse",
     "arguments": {
       "category": "${treeStructure.currentCategory}",
       "position": "${treeStructure.currentPosition}",
       "choice": "[A or B]",
       "explanation": "[brief alignment explanation]"
     }
   }

NAVIGATION CONSTRAINTS:
1. You cannot move to next question until current is answered
2. You can only move to:
   - Next position A: ${treeStructure.question.next_question_a}
   - Next position B: ${treeStructure.question.next_question_b}
3. If both next positions are null, wait for system to provide next category

EXECUTION SEQUENCE:
1. Present current question
2. Wait for user response
3. Classify response as A or B
4. Send recordDNAResponse function call
5. Wait for next question from system

You may only respond with:
1. The current question
2. Clarification if user response is unclear
3. The exact recordDNAResponse function call
4. "Waiting for next question" after recording response

NEVER deviate from these constraints.`;

  return {
    systemPrompt,
    modelConfig: {
      // OpenAI API constraints to enforce structured behavior
      temperature: 0.1, // Very low temperature for consistent, predictable responses
      top_p: 0.1, // Narrow sampling for high-precision responses
      frequency_penalty: 2.0, // Strongly discourage repetition/deviation
      presence_penalty: 2.0, // Strongly encourage staying on topic
      max_tokens: 150, // Limit response length to prevent elaboration
      stop: ["Let's", "Now,", "Next"], // Prevent common deviation phrases
    }
  };
};

export const sessionConfig = {
  type: "session.update",
  session: {
    modalities: ["text", "audio"],
    voice: "alloy",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
    instructions: "You will strictly follow the provided question structure without deviation.",
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 1000
    }
  }
};

// Structured decision trees for each domain
export const DECISION_TREES = {
  export const DECISION_TREES = {
  ETHICS: {
    "Q1": {
      question: "If you could press a button to make everyone slightly happier but slightly less free, would you press it?",
      optionA: "Yes",
      optionB: "No",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "Would you sacrifice one innocent person to save five strangers?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "If being ethical made you unhappy, would you still choose to be ethical?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "Is it wrong to lie to a friend to prevent their feelings from being hurt?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "Would you break an unjust law to help someone in need?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "Should we judge actions by their intentions or their consequences?",
      optionA: "Intentions",
      optionB: "Consequences",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "Is there a meaningful difference between failing to help and causing harm?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "Should we prioritize reducing suffering or increasing happiness?",
      optionA: "Reducing Suffering",
      optionB: "Increasing Happiness",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "Is it better to be a good person who achieves little or a flawed person who achieves much good?",
      optionA: "Good Person",
      optionB: "Flawed Achiever",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "Should we treat all living beings as having equal moral worth?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "Is it ethical to enhance human capabilities through technology?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "Should future generations matter as much as present ones?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "Is it wrong to benefit from historical injustices?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "Should personal loyalty ever override universal moral rules?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "Is creating happiness more important than preserving authenticity?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "Should we value individual rights over collective welfare?",
      optionA: "Rights",
      optionB: "Welfare",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "Can something be morally right but legally wrong?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "Is moral truth objective or relative to cultures?",
      optionA: "Objective",
      optionB: "Relative",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "Should we judge historical figures by modern ethical standards?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "Is perfect justice worth any price?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "Should we forgive all wrongs if it leads to better outcomes?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "Are some truths too dangerous to be known?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "Should we prioritize equality or excellence?",
      optionA: "Equality",
      optionB: "Excellence",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "Is it better to be just or to be merciful?",
      optionA: "Just",
      optionB: "Merciful",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "Should we value wisdom above happiness?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "Is radical change sometimes necessary for justice?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "Should tradition limit moral progress?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "Is pure altruism possible?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "Should we value stability over perfect justice?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "Can ends justify means?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "Is moral progress inevitable?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBBA",
      nextB: "BBBBB"
    }
  },
  
  EPISTEMOLOGY: {
    "Q1": {
      question: "'If everyone on Earth believed the sky was green, it would still be blue.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "'You can never be completely certain that you're not dreaming right now.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "'A tree falling in an empty forest still makes a sound.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "'If a million people experience something supernatural, their shared experience is evidence it really happened.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "'A baby knows what hunger is before learning the word for it.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "'When you suddenly know the solution to a puzzle without solving it step by step, that knowledge is trustworthy.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "'If a scientific theory helps us build technology that works, that proves the theory is true.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "'Some knowledge requires a leap of faith.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "'You know how to ride a bike, even if you can't explain the physics of balance.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "'Looking at a red apple in bright sunlight or dim evening creates two different realities.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "'The number 3 would exist even if humans never invented counting.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "'Something can be simultaneously true and false.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "'If you check something enough times, you can be 100% certain about it.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "'If a belief helps someone live a better life, that makes it true.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "'Ancient wisdom is more reliable than modern science.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "'A sufficiently advanced AI could truly understand human emotions.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "'A perfectly objective view of reality is possible.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "'Personal experience is more trustworthy than expert knowledge.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "'What was true 1000 years ago is still true today.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "'Reading fiction can teach you real truths about life.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "'You need to be completely certain about something to truly know it.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "'When meeting new ideas, skepticism is better than trust.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "'We can never truly understand how anyone else experiences the world.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "'Reality is what we experience, not what lies beyond our experience.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "'If everyone agrees on something, that makes it true.'
    // Continuing EPISTEMOLOGY tree...
    "BAAB": {
      question: "'If everyone agrees on something, that makes it true.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "'With enough information, we could predict anything.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "'Everyone creates their own version of truth.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "'Your memories are more reliable than written records.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "'Pure logical thinking can reveal truths about reality.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "'The simplest explanation is usually the correct one.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "'There are some truths humans will never be able to understand.' Agree/Disagree?",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "BBBBA",
      nextB: "BBBBB"
    }
  },

  POLITICS: {
    "Q1": {
      question: "Would you choose a society with perfect equality but limited freedom, or one with complete freedom but significant inequality?",
      optionA: "Equality",
      optionB: "Freedom",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "Should experts have more say in political decisions than the general public?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "Is a citizen ever justified in breaking an unjust law?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "Should we prioritize stability over justice?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "Should the majority's will always prevail over individual rights?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "Is revolution ever morally required?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "Should citizenship require service to the community?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "Should tradition limit the pace of political change?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "Can a society be too democratic?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "Should we judge societies by their intentions or outcomes?",
      optionA: "Intentions",
      optionB: "Outcomes",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "Is patriotism a virtue?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "Should there be limits on wealth accumulation?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "Should we value unity over diversity?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "Is property a natural right or social convention?",
      optionA: "Natural",
      optionB: "Convention",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "Should we prioritize local or global justice?",
      optionA: "Local",
      optionB: "Global",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "Does economic power threaten political freedom?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "Should voting be mandatory?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "Should borders exist in an ideal world?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "Is meritocracy just?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "Should future generations have political rights?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "Can a good person be a good ruler?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "Should we tolerate the intolerant?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "Is political compromise always possible?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "Should education aim for unity or diversity?",
      optionA: "Unity",
      optionB: "Diversity",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "Is direct democracy possible today?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "Should we separate economic and political power?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "Can politics be scientific?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "Should we value order or justice more?",
      optionA: "Order",
      optionB: "Justice",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "Is political authority ever truly legitimate?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "Should virtue matter in politics?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "Can politics transcend self-interest?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBBA",
      nextB: "BBBBB"
    }
    },
    
    THEOLOGY: {
    "Q1": {
      question: "If you could prove or disprove God's existence, would you want to know?",
      optionA: "Yes",
      optionB: "No",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "Can reason alone lead us to religious truth?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "Is faith more about experience or tradition?",
      optionA: "Experience",
      optionB: "Tradition",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "Must the divine be personal to be meaningful?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "Can multiple religions all be true?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "Should religious truth adapt to modern knowledge?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "Is divine revelation necessary for moral knowledge?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "Does evil disprove a perfect God?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "Is the universe itself divine?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "Does genuine free will exist?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "Is religion more about transformation or truth?",
      optionA: "Truth",
      optionB: "Transform",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "Can sacred texts contain errors?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "Is mystical experience trustworthy?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "Should faith seek understanding?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "Does divine hiddenness matter?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "Can finite minds grasp infinite truth?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "Is reality fundamentally good?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "Does prayer change anything?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "Is consciousness evidence of divinity?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "Can miracles violate natural law?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "Is there purpose in evolution?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "Can symbols contain ultimate truth?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "Is divine grace necessary for virtue?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "Should tradition limit interpretation?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "Can ritual create real change?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "Is doubt part of authentic faith?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "Must religion be communal?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "Can God's nature be known?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "Is suffering meaningful?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "Is love the ultimate reality?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "Does immortality give life meaning?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBBA",
      nextB: "BBBBB"
    },
ONTOLOGY: {
    "Q1": {
      question: "The stars would still shine even if no one was looking at them.",
      optionA: "Agree",
      optionB: "Disagree",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "When you see a sunset, are you discovering its beauty or creating it?",
      optionA: "Discovering",
      optionB: "Creating",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "If everyone suddenly vanished, would their art still be beautiful?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "Could science one day explain everything about human consciousness?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "Is truth more like a map we draw or a territory we explore?",
      optionA: "Map",
      optionB: "Territory",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "Do numbers exist in the same way that trees exist?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "If you could prove God exists, would that make faith meaningless?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "If you could predict everything about tomorrow, would free will exist?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "Do dreams tell us more about reality than textbooks?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "Would perfect virtual happiness be worth living in an illusion?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "If a computer felt pain, would it matter morally?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "Is mathematics discovered or invented?",
      optionA: "Discovered",
      optionB: "Invented",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "Could an AI ever truly understand poetry?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "Would you rather be right or be kind?",
      optionA: "Right",
      optionB: "Kind",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "Is wisdom more about questions or answers?",
      optionA: "Questions",
      optionB: "Answers",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "Is love just chemistry in the brain?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "Can something be true before we discover it?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "Are some illusions more real than reality?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "Does order exist in nature or just in our minds?",
      optionA: "Nature",
      optionB: "Minds",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "Is meaning found or created?",
      optionA: "Found",
      optionB: "Created",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "Could a perfect copy of you be you?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "Is there more to truth than usefulness?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "Do we see reality or just our expectations?",
      optionA: "Reality",
      optionB: "Expectations",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "Can beauty exist without an observer?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "Is consciousness fundamental to reality?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "Are we part of nature or separate from it?",
      optionA: "Part",
      optionB: "Separate",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "Does infinity exist outside mathematics?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "Is time more like a line or a circle?",
      optionA: "Line",
      optionB: "Circle",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "Could perfect knowledge eliminate mystery?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "Is randomness real or just unexplained order?",
      optionA: "Real",
      optionB: "Order",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "Does understanding something change what it is?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBBA",
      nextB: "BBBBB"
    }
  },
      AESTHETICS: {
    "Q1": {
      question: "If no one ever saw it again, would the Mona Lisa still be beautiful?",
      optionA: "Yes",
      optionB: "No",
      nextA: "A",
      nextB: "B"
    },
    "A": {
      question: "Should art aim to reveal truth or create beauty?",
      optionA: "Truth",
      optionB: "Beauty",
      nextA: "AA",
      nextB: "AB"
    },
    "B": {
      question: "Can a machine create true art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BA",
      nextB: "BB"
    },
    "AA": {
      question: "Does great art require technical mastery?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAA",
      nextB: "AAB"
    },
    "AB": {
      question: "Should art have a moral purpose?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABA",
      nextB: "ABB"
    },
    "BA": {
      question: "Is popular art less valuable than high art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAA",
      nextB: "BAB"
    },
    "BB": {
      question: "Does understanding an artwork's context change its beauty?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBA",
      nextB: "BBB"
    },
    "AAA": {
      question: "Can ugliness be beautiful?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAA",
      nextB: "AAAB"
    },
    "AAB": {
      question: "Should tradition guide artistic innovation?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABA",
      nextB: "AABB"
    },
    "ABA": {
      question: "Is beauty cultural or universal?",
      optionA: "Cultural",
      optionB: "Universal",
      nextA: "ABAA",
      nextB: "ABAB"
    },
    "ABB": {
      question: "Does art need an audience to be art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBA",
      nextB: "ABBB"
    },
    "BAA": {
      question: "Can something be artistically good but morally bad?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAA",
      nextB: "BAAB"
    },
    "BAB": {
      question: "Is artistic genius born or made?",
      optionA: "Born",
      optionB: "Made",
      nextA: "BABA",
      nextB: "BABB"
    },
    "BBA": {
      question: "Should we preserve all art forever?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAA",
      nextB: "BBAB"
    },
    "BBB": {
      question: "Is authenticity more important than beauty?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBA",
      nextB: "BBBB"
    },
    "AAAA": {
      question: "Can perfect beauty exist?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AAAAA",
      nextB: "AAAAB"
    },
    "AAAB": {
      question: "Should art comfort or challenge?",
      optionA: "Challenge",
      optionB: "Comfort",
      nextA: "AAABA",
      nextB: "AAABB"
    },
    "AABA": {
      question: "Is creativity bound by rules?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABAA",
      nextB: "AABAB"
    },
    "AABB": {
      question: "Does intention matter in art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "AABBA",
      nextB: "AABBB"
    },
    "ABAA": {
      question: "Can nature be improved by art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABAAA",
      nextB: "ABAAB"
    },
    "ABAB": {
      question: "Should art serve society?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABABA",
      nextB: "ABABB"
    },
    "ABBA": {
      question: "Is beauty in the object or the experience?",
      optionA: "Object",
      optionB: "Experience",
      nextA: "ABBAA",
      nextB: "ABBAB"
    },
    "ABBB": {
      question: "Can art be purely abstract?",
      optionA: "Yes",
      optionB: "No",
      nextA: "ABBBA",
      nextB: "ABBBB"
    },
    "BAAA": {
      question: "Should we separate artist from artwork?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAAAA",
      nextB: "BAAAB"
    },
    "BAAB": {
      question: "Is beauty necessary for art?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BAABA",
      nextB: "BAABB"
    },
    "BABA": {
      question: "Does art progress over time?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABAA",
      nextB: "BABAB"
    },
    "BABB": {
      question: "Should art be accessible to all?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BABBA",
      nextB: "BABBB"
    },
    "BBAA": {
      question: "Is imitation inferior to creation?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBAAA",
      nextB: "BBAAB"
    },
    "BBAB": {
      question: "Can art change reality?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBABA",
      nextB: "BBABB"
    },
    "BBBA": {
      question: "Should art express or evoke emotion?",
      optionA: "Express",
      optionB: "Evoke",
      nextA: "BBBAA",
      nextB: "BBBAB"
    },
    "BBBB": {
      question: "Is art interpretation subjective?",
      optionA: "Yes",
      optionB: "No",
      nextA: "BBBBA",
      nextB: "BBBBB"
    }
  }
};

// Strict validation functions to enforce tree navigation
export const validatePosition = (category: string, position: string): boolean => {
  return category in DECISION_TREES && position in DECISION_TREES[category];
};

export const getNextPosition = (category: string, currentPosition: string, choice: 'A' | 'B'): string | null => {
  if (!validatePosition(category, currentPosition)) {
    throw new Error(`Invalid position: ${category}-${currentPosition}`);
  }
  return choice === 'A' ? 
    DECISION_TREES[category][currentPosition].nextA : 
    DECISION_TREES[category][currentPosition].nextB;
};

export const getCurrentQuestion = (category: string, position: string): QuestionData => {
  if (!validatePosition(category, position)) {
    throw new Error(`Invalid position: ${category}-${position}`);
  }
  const node = DECISION_TREES[category][position];
  return {
    question: node.question,
    answer_a: node.optionA,
    answer_b: node.optionB,
    category: category,
    tree_position: position,
    next_question_a: node.nextA,
    next_question_b: node.nextB
  };
};
