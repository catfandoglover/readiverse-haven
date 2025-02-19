
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getDNAPrompt } from './prompts.ts';

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Modified query to correctly join with great_questions
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

    if (questionError) {
      console.error('Database query error:', questionError);
      throw new Error(`Failed to fetch initial question: ${questionError.message}`);
    }

    if (!initialQuestion) {
      console.error('No initial question found in database');
      throw new Error('No initial question found');
    }

    console.log('Initial question data:', initialQuestion);

    // Safely access the question data with null checks
    if (!initialQuestion.great_questions) {
      console.error('No linked question found:', initialQuestion);
      throw new Error('Question data is missing');
    }

    // Create the tree structure for the prompt with safe accessors
    const treeStructure = {
      currentCategory: initialQuestion.category,
      currentPosition: initialQuestion.tree_position,
      question: {
        question: initialQuestion.great_questions.question,
        answer_a: initialQuestion.great_questions.answer_a,
        answer_b: initialQuestion.great_questions.answer_b,
        category: initialQuestion.category,
        tree_position: initialQuestion.tree_position,
        next_question_a: initialQuestion.next_question_a_id,
        next_question_b: initialQuestion.next_question_b_id
      }
    };

    console.log('Tree structure:', treeStructure);

    // Get the system prompt with the initial question
    const { systemPrompt, modelConfig } = getDNAPrompt(treeStructure);

    console.log('Starting token request to OpenAI...');

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
    console.log('OpenAI Response:', data);

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
