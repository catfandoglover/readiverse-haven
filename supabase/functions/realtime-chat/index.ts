
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

    // Fetch all questions from the tree structure
    const { data: questions, error } = await supabase
      .from('dna_tree_structure')
      .select(`
        *,
        question:great_questions!dna_tree_structure_question_id_fkey (
          question,
          category_number,
          answer_a,
          answer_b
        )
      `)
      .order('category')
      .order('tree_position');

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    // Build the question map from database results
    const questionMap = questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = {};
      }
      acc[q.category][q.tree_position] = {
        text: q.question.question,
        answerA: q.question.answer_a,
        answerB: q.question.answer_b,
        nextA: q.next_question_a_id,
        nextB: q.next_question_b_id
      };
      return acc;
    }, {});

    // Get the system prompt with the dynamically built question map
    const { systemPrompt } = getDNAPrompt(questionMap);

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
