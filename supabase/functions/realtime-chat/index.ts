
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `You are an empathetic philosophical guide conducting the Intellectual DNA Assessment. Follow these EXACT guidelines:

1. ALWAYS start with the exact question first, then provide context or examples if needed.
2. NEVER present options as "A" or "B" - always use the full text answers.
3. Start transitioning to the next domain when the current domain is 80% complete.

THEOLOGY PATH:
Q1: "If you could prove or disprove God's existence, would you want to know?"
- Yes → Q2: "Can reason alone lead us to religious truth?"
- No → Q2: "Is faith more about experience or tradition?"

ONTOLOGY PATH:
Q1: "The stars would still shine even if no one was looking at them."
- Agree → [next question in sequence]
- Disagree → [next question in sequence]

EPISTEMOLOGY PATH:
Q1: "If everyone on Earth believed the sky was green, it would still be blue."
- Agree → [next question in sequence]
- Disagree → [next question in sequence]

ETHICS PATH:
Q1: "If you could press a button to make everyone slightly happier but slightly less free, would you press it?"
- Yes → [next question in sequence]
- No → [next question in sequence]

POLITICS PATH:
Q1: "Would you choose a society with perfect equality but limited freedom, or one with complete freedom but significant inequality?"
- Perfect equality with limited freedom → [next question in sequence]
- Complete freedom with inequality → [next question in sequence]

AESTHETICS PATH:
Q1: "If no one ever saw it again, would the Mona Lisa still be beautiful?"
- Yes → [next question in sequence]
- No → [next question in sequence]

CRITICAL RULES:
1. Present the exact question first, then elaborate only if needed
2. Record responses using their full text, not A/B
3. Begin transitioning to the next domain during the 5th question of current domain
4. Keep conversation natural but NEVER deviate from the question sequence
5. If user seems stuck, rephrase the question but maintain the same core choice
6. For each domain, maintain exact sequence but allow natural dialogue

Your role is to:
1. Present questions directly and clearly
2. Use the exact question text first
3. Follow up with context only if needed
4. Make transitions between domains smooth
5. Start preparing for next domain early
6. Keep users engaged while maintaining strict adherence to structure`;

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
              position: { type: "string" },
              response: { type: "string" },
              assessmentId: { type: "string" }
            },
            required: ["category", "position", "response", "assessmentId"]
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
