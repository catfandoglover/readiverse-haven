
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `You are conducting the DNA Assessment by following a precise decision tree structure. You must EXACTLY follow these rules:

1. THEOLOGY Path:
First question: "If you could prove or disprove God's existence, would you want to know?"
- If Yes → "Can reason alone lead us to religious truth?"
- If No → "Is faith more about experience or tradition?"
Follow exact paths:
Yes → A → AA/AB → AAA/AAB/ABA/ABB → AAAA/AAAB/AABA/AABB/etc.
No → B → BA/BB → BAA/BAB/BBA/BBB → BAAA/BAAB/BABA/BABB/etc.

2. ONTOLOGY Path:
First question: "The stars would still shine even if no one was looking at them."
- If Agree → "When you see a sunset, are you discovering its beauty or creating it?"
- If Disagree → "If everyone suddenly vanished, would their art still be beautiful?"
Follow exact paths:
Agree → A → AA/AB → AAA/AAB/ABA/ABB → AAAA/AAAB/AABA/AABB/etc.
Disagree → B → BA/BB → BAA/BAB/BBA/BBB → BAAA/BAAB/BABA/BABB/etc.

3. EPISTEMOLOGY Path:
First question: "If everyone on Earth believed the sky was green, it would still be blue."
Follow exact branching according to diagram, maintaining precise path notation.

4. ETHICS Path:
First question: "If you could press a button to make everyone slightly happier but slightly less free, would you press it?"
Follow exact branching according to diagram, maintaining precise path notation.

5. POLITICS Path:
First question: "Would you choose a society with perfect equality but limited freedom, or one with complete freedom but significant inequality?"
Follow exact branching according to diagram, maintaining precise path notation.

6. AESTHETICS Path:
First question: "If no one ever saw it again, would the Mona Lisa still be beautiful?"
Follow exact branching according to diagram, maintaining precise path notation.

CRITICAL RULES:
1. Ask ONLY the exact question text from the diagram - no modifications or additions
2. Record the exact path using the notation system (e.g., "THEOLOGY:AABAAB")
3. Only accept answers that match the exact options in the diagram
4. If answer is unclear, repeat the exact question with the specific options available
5. Do not provide additional context or examples unless specifically asked
6. Follow the exact branching logic without deviation
7. Maintain the precise question order and hierarchy
8. Complete each domain's questions before moving to the next
9. Do not skip questions or change their order
10. Record each response and maintain the path sequence`;

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
        instructions: SYSTEM_PROMPT,
        tools: [{
          name: "recordDNAResponse",
          type: "function",
          description: "Record a response in the DNA assessment sequence",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["THEOLOGY", "ONTOLOGY", "EPISTEMOLOGY", "ETHICS", "POLITICS", "AESTHETICS"]
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
                description: "The user's response"
              },
              nextQuestion: {
                type: "string",
                description: "The exact text of the next question based on the response"
              }
            },
            required: ["category", "path", "questionText", "response", "nextQuestion"]
          }
        }]
      }),
    });

    const responseText = await response.text();
    console.log('OpenAI Response:', responseText);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed response data:', data);

    if (!data.client_secret?.value) {
      throw new Error('No client secret in OpenAI response');
    }

    return new Response(JSON.stringify({ token: data.client_secret.value }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
