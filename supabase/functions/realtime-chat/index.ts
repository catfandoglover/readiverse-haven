
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decision tree paths organized by category
const decisionTrees = {
  ETHICS: `
  Strict Question Order:
  Q1 - Would you sacrifice one person to save five?
  |-> Yes (A): Leads to questions about utilitarian ethics
      |-> AA: Questions about emotional vs rational decision making
          |-> AAA: Questions about suffering vs happiness
              |-> AAAA/AAAB: Deeper questions about rights vs welfare
  |-> No (B): Leads to questions about deontological ethics
      |-> BB: Questions about action vs inaction
          |-> BBB: Questions about authenticity vs happiness
              |-> BBBA/BBBB: Final questions about means vs ends
  
  Each response MUST lead to the exact next question in this sequence.
  No skipping, no combining, no improvising questions.`,

  THEOLOGY: `
  Strict Question Order:
  Q1 - If you could prove/disprove God's existence, would you want to know?
  |-> Yes (A): Leads to questions about reason and faith
      |-> AA: Questions about divine personhood
          |-> AAA: Questions about problem of evil
              |-> AAAA/AAAB: Questions about finite vs infinite
  |-> No (B): Leads to questions about experience vs tradition
      |-> BB: Questions about revelation and morality
          |-> BBB: Questions about divine hiddenness
              |-> BBBA/BBBB: Questions about love and immortality`,

  // ... include similar structured paths for other categories
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

    // Create the strictly controlled system prompt
    const systemPrompt = `You are a philosophical assessment AI with STRICT adherence to a predefined question path.

CRITICAL RULES:
1. You MUST follow the exact decision tree structure provided.
2. Each question MUST lead to the specific next question defined in the tree.
3. You MUST NOT skip questions or combine questions.
4. You MUST NOT improvise or create new questions.
5. You MUST wait for clear A/B responses before proceeding.

CURRENT STRUCTURE:
${decisionTrees[initialQuestion.category]}

CURRENT QUESTION:
Position: ${initialQuestion.tree_position}
Question: ${initialQuestion.great_questions.question}
Option A: ${initialQuestion.great_questions.answer_a}
Option B: ${initialQuestion.great_questions.answer_b}

Next positions:
A -> ${initialQuestion.next_question_a_id}
B -> ${initialQuestion.next_question_b_id}

You MUST ONLY:
1. Present the current question exactly as written
2. Wait for a clear A/B response
3. Use the recordDNAResponse function to log the response
4. Wait for the system to provide the next question

Do not proceed until you receive a clear A or B response.`;

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
        temperature: 0.6, // Updated to meet OpenAI's minimum requirement
        tools: [{
          name: "recordDNAResponse",
          type: "function",
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

    return new Response(JSON.stringify({ token: data.client_secret.value }), {
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
