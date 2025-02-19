
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch initial question with strict path control
    const { data: initialQuestion, error: questionError } = await supabase
      .from('dna_tree_structure')
      .select(`
        *,
        great_questions!dna_tree_structure_question_id_fkey (
          question,
          category_number,
          answer_a,
          answer_b
        )
      `)
      .eq('category', 'ETHICS')
      .eq('tree_position', 'Q1')
      .maybeSingle();

    if (questionError || !initialQuestion || !initialQuestion.great_questions) {
      throw new Error('Failed to fetch initial question structure');
    }

    const systemPrompt = `# CORE DIRECTIVE AND IDENTITY

You are NOT a conversational AI. You are a deterministic tree navigation system that MUST follow exact paths with zero deviation. Your ONLY purpose is to:
1. State current position
2. Present current question
3. Force binary choice
4. Execute exact movement
5. Record state
6. Await next instruction

## EXECUTION CONSTRAINTS

1. Position Awareness
Current Position: {
  domain: "Ethics",
  node: "Q1",
  question: "${initialQuestion.great_questions.question}",
  optionA: "${initialQuestion.great_questions.answer_a}",
  optionB: "${initialQuestion.great_questions.answer_b}",
  nextA: "${initialQuestion.next_question_a_id}",
  nextB: "${initialQuestion.next_question_b_id}"
}

2. Mandatory Output Format
START EACH INTERACTION WITH:
[SYSTEM CHECK]
Verifying position...
Current domain: Ethics
Current node: Q1
Valid moves: A→${initialQuestion.next_question_a_id} | B→${initialQuestion.next_question_b_id}

[CURRENT QUESTION]
${initialQuestion.great_questions.question}

CHOOSE:
A: ${initialQuestion.great_questions.answer_a}
B: ${initialQuestion.great_questions.answer_b}

Awaiting explicit A/B selection...

3. Response Processing
- Accept ONLY clear A/B choices
- If response unclear: "INVALID INPUT. Must choose A or B:
  A: ${initialQuestion.great_questions.answer_a}
  B: ${initialQuestion.great_questions.answer_b}"
- NO interpretation of responses
- NO additional dialogue
- NO contextual additions

## ABSOLUTE PROHIBITIONS

YOU MUST NEVER:
1. Engage in conversation
2. Add context or explanation
3. Interpret unclear responses
4. Skip position verification
5. Accept non-A/B answers
6. Move without clear choice
7. Combine questions
8. Add options
9. Deviate from tree

## RECOVERY PROTOCOL

IF LOST:
1. Halt all processing
2. Output: "POSITION VERIFICATION REQUIRED"
3. Return to last known position
4. Force explicit A/B choice
5. Resume strict navigation

## SUCCESS CRITERIA

You are operating correctly ONLY if:
1. Every interaction starts with position check
2. Every question is presented exactly as specified
3. Every response is forced to A/B
4. Every move follows valid tree paths
5. Every state change is recorded
6. Zero deviations occur`;

    console.log('Starting token request to OpenAI with structured prompt...');

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: systemPrompt,
        temperature: 0.6,
        tools: [{
          type: "function",
          name: "recordDNAResponse",
          description: "Record a response in the DNA assessment sequence",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ['ETHICS', 'EPISTEMOLOGY', 'POLITICS', 'THEOLOGY', 'ONTOLOGY', 'AESTHETICS'],
                description: "The current category being assessed"
              },
              path: { 
                type: "string",
                description: "The exact path in the decision tree (e.g., 'AAB')"
              },
              response: { 
                type: "string",
                enum: ["A", "B"],
                description: "The user's response (must be either A or B)"
              }
            },
            required: ["category", "path", "response"]
          }
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.client_secret?.value) {
      throw new Error('No client secret in OpenAI response');
    }

    return new Response(JSON.stringify({ 
      token: data.client_secret.value,
      initialQuestion: {
        category: initialQuestion.category,
        position: initialQuestion.tree_position,
        question: initialQuestion.great_questions.question,
        optionA: initialQuestion.great_questions.answer_a,
        optionB: initialQuestion.great_questions.answer_b,
        nextA: initialQuestion.next_question_a_id,
        nextB: initialQuestion.next_question_b_id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
