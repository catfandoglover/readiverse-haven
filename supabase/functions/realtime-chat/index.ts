
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch questions from decision_tree_view
    const { data: questions, error: dbError } = await supabaseClient
      .from('decision_tree_view')
      .select('*')
      .order('category, tree_position');

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate prompt using the same logic as the frontend
    const categoryOrder = ['ETHICS', 'EPISTEMOLOGY', 'POLITICS', 'THEOLOGY', 'ONTOLOGY', 'AESTHETICS'];
    const categorizedQuestions = questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    }, {});

    let systemPrompt = `You are conducting the DNA Assessment by following a precise decision tree structure in this exact order:\n\n`;

    categoryOrder.forEach((category, index) => {
      const categoryQuestions = categorizedQuestions[category] || [];
      const firstQuestion = categoryQuestions.find(q => q.tree_position === 'A')?.question;

      systemPrompt += `${index + 1}. ${category} Path (${index === 0 ? 'FIRST' : index === categoryOrder.length - 1 ? 'LAST' : `${index + 1}TH`}):
First question: "${firstQuestion}"
Follow exact branching according to diagram, maintaining precise path notation.
A → AA/AB → AAA/AAB/ABA/ABB → AAAA/AAAB/AABA/AABB/etc.\n\n`;
    });

    systemPrompt += `CRITICAL RULES:
1. You MUST follow this exact order: ${categoryOrder.join(' → ')}
2. Never skip ahead or change the order of domains
3. Complete all questions in one domain before moving to the next
4. Ask ONLY the exact question text from the diagram - no modifications
5. Record the exact path using the notation system (e.g., "${categoryOrder[0]}:AABAAB")
6. Only accept clear "A" or "B" answers
7. If answer is unclear, repeat the exact question with the specific options
8. Do not provide additional context unless asked
9. Record each response in the exact sequence
10. Maintain precise question hierarchy within each domain`;

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
                enum: categoryOrder
              },
              path: { 
                type: "string",
                description: "The exact path in the decision tree (e.g., 'AABAAB')"
              },
              questionText: { 
                type: "string",
                description: "The exact question text from the diagram"
              },
              response: { 
                type: "string",
                enum: ["A", "B"],
                description: "The user's response"
              }
            },
            required: ["category", "path", "questionText", "response"]
          }
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
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
