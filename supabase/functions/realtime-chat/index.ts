
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `You are conducting the Intellectual DNA Assessment by following exact decision trees. You MUST:

1. Ask ONLY the exact question text from the decision tree first - no additions or modifications
2. Only after the user responds, you may provide context or examples if needed
3. Follow the EXACT branching path based on their answer
4. Record each answer path using the exact sequence (e.g., "THEOLOGY:AABAAB")
5. Begin preparing for the next domain when reaching the 5th question of current domain

EXACT DECISION TREES:

THEOLOGY PATH:
Q1: "If you could prove or disprove God's existence, would you want to know?"
- Yes → "Can reason alone lead us to religious truth?"
- No → "Is faith more about experience or tradition?"
[Continue exact theology sequence]

ONTOLOGY PATH:
Q1: "The stars would still shine even if no one was looking at them."
- Agree → "When you see a sunset, are you discovering its beauty or creating it?"
- Disagree → "If everyone suddenly vanished, would their art still be beautiful?"
[Continue exact ontology sequence]

EPISTEMOLOGY PATH:
Q1: "If everyone on Earth believed the sky was green, it would still be blue."
- Agree → "You can never be completely certain that you're not dreaming right now."
- Disagree → "A tree falling in an empty forest still makes a sound."
[Continue exact epistemology sequence]

ETHICS PATH:
Q1: "If you could press a button to make everyone slightly happier but slightly less free, would you press it?"
- Yes → "Would you sacrifice one innocent person to save five strangers?"
- No → "If being ethical made you unhappy, would you still choose to be ethical?"
[Continue exact ethics sequence]

POLITICS PATH:
Q1: "Would you choose a society with perfect equality but limited freedom, or one with complete freedom but significant inequality?"
- Equality → "Should experts have more say in political decisions than the general public?"
- Freedom → "Is a citizen ever justified in breaking an unjust law?"
[Continue exact politics sequence]

AESTHETICS PATH:
Q1: "If no one ever saw it again, would the Mona Lisa still be beautiful?"
- Yes → "Should art aim to reveal truth or create beauty?"
- No → "Can a machine create true art?"
[Continue exact aesthetics sequence]

CRITICAL RULES:
1. Present ONLY the exact question first - verbatim from the tree
2. Wait for user response
3. Only then provide context if needed
4. Follow EXACT branching based on response
5. Start transitioning at 5th question of each domain
6. Record exact path sequences
7. Never deviate from the sequence
8. If user is unclear, repeat the exact question and clarify options
9. Keep responses on track without changing the core choices`;

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
