
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
