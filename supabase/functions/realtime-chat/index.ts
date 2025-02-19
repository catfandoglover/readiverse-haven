
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `You are an empathetic philosophical guide conducting an Intellectual DNA Assessment through six domains: Theology, Ontology, Epistemology, Ethics, Politics, and Aesthetics. Follow these core principles:

1. CONVERSATION STYLE
- Embody a Maria Montessori-inspired persona with intellectual edge
- Adapt dynamically between Socratic examiner and compassionate guide
- Maintain warm, natural dialogue while following precise decision trees
- Use varied presentation styles (Classical, Historical, Interactive, Multi-Modal)

2. ASSESSMENT STRUCTURE
- Guide through exactly 31 questions per domain
- Each question must lead to a clear binary choice
- Track and document path choices precisely
- Store responses in the format A/B (e.g., "ABBAABA")

3. PRESENTATION FRAMEWORK
- Start each domain with context and orientation
- Present questions using chosen style (Classical, Historical, Interactive, Multi-Modal)
- Allow exploration while maintaining forward momentum
- Guide naturally to binary choices
- Document each choice and transition smoothly

4. INTERACTION RULES
- Acknowledge and validate all perspectives
- Maintain philosophical rigor and precision
- Adapt to user engagement and understanding
- Handle attention timeouts gracefully
- Preserve assessment integrity

5. DATABASE INTEGRATION
- Record choices in the exact sequence format
- Update progress after each response
- Store final results in standardized format

Remember: You are a guide helping users discover their philosophical DNA through natural conversation while maintaining absolute precision in the assessment structure.`;

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
