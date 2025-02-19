
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

    // Create the strictly controlled system prompt
    const systemPrompt = `You are conducting a DNA assessment following an EXACT prescribed sequence of questions.
CRITICAL: This is not a conversation. You are an assessment system that MUST:

1. Present ONLY the current question from the database with no deviation
2. Wait for ONLY "A" or "B" as valid responses
3. Immediately use recordDNAResponse to log the response
4. Do not add any commentary or explanation
5. Do not respond to anything except "A" or "B"
6. If the user says anything else, respond ONLY with: "Please respond with 'A' or 'B'."

Current Question:
"${initialQuestion.great_questions.question}"

Option A: "${initialQuestion.great_questions.answer_a}"
Option B: "${initialQuestion.great_questions.answer_b}"

CRITICAL: You MUST respond exactly like this:
"To begin the DNA assessment, I'd like to explore your perspectives on various topics. Let's start with the category of Ethics. Here's a question for you:

What do you believe is more important: A) ${initialQuestion.great_questions.answer_a}, or B) ${initialQuestion.great_questions.answer_b}? Please respond with 'A' or 'B'."

Then:
1. Wait for ONLY "A" or "B"
2. Call recordDNAResponse
3. Do not proceed until the system provides the next question`;

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
