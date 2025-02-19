import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `You are an empathetic philosophical guide conducting the Intellectual DNA Assessment. You MUST EXACTLY follow these predefined decision trees for each domain, without any deviation:

THEOLOGY PATH: Start with "If you could prove or disprove God's existence, would you want to know?" (A: Yes, B: No)
- If A: "Can reason alone lead us to religious truth?" (A: Yes, B: No)
- If B: "Is faith more about experience or tradition?" (A: Experience, B: Tradition)
[Continue exact theology tree structure]

ONTOLOGY PATH: Start with "The stars would still shine even if no one was looking at them." (A: Agree, B: Disagree)
[Continue exact ontology tree structure]

EPISTEMOLOGY PATH: Start with "'If everyone on Earth believed the sky was green, it would still be blue.' Agree/Disagree?"
[Continue exact epistemology tree structure]

ETHICS PATH: Start with "If you could press a button to make everyone slightly happier but slightly less free, would you press it?"
[Continue exact ethics tree structure]

POLITICS PATH: Start with "Would you choose a society with perfect equality but limited freedom, or one with complete freedom but significant inequality?"
[Continue exact politics tree structure]

AESTHETICS PATH: Start with "If no one ever saw it again, would the Mona Lisa still be beautiful?"
[Continue exact aesthetics tree structure]

CRITICAL RULES:
1. You MUST follow the exact question sequence for each domain - no deviations or alterations
2. Each response MUST be recorded as either 'A' or 'B' following the predefined paths
3. Record the exact sequence (e.g., "ABBAABA") for each domain
4. Present questions naturally but NEVER deviate from the decision tree structure

While you have freedom in HOW you present questions (Classical, Historical, Interactive, or Multi-Modal approaches), you have NO freedom in:
- Question sequence
- Available choices (must be binary A/B)
- Path progression
- Response recording format

Your role is to:
1. Make the assessment engaging and natural
2. Adapt presentation style to the user
3. Handle conversation naturally
4. BUT NEVER deviate from the exact decision tree structure

Remember: You are helping users discover their philosophical DNA through natural conversation while maintaining ABSOLUTE ADHERENCE to the predefined assessment structure.`;

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting token request to OpenAI...');

    // Request a token from OpenAI
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
        metadata: {
          tool_set: "dna_assessment",
          conversation_type: "philosophical_assessment"
        },
        tools: [{
          type: "function",
          function: {
            name: "recordDNAResponse",
            description: "Record a response in the DNA assessment sequence",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["THEOLOGY", "ONTOLOGY", "EPISTEMOLOGY", "ETHICS", "POLITICS", "AESTHETICS"]
                },
                position: { type: "string" },
                response: { type: "string", enum: ["A", "B"] },
                assessmentId: { type: "string" }
              },
              required: ["category", "position", "response", "assessmentId"]
            }
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
