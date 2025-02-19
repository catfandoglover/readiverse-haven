
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sign } from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create an ephemeral token for OpenAI
    const token = await sign(
      {
        "iat": Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
        "iss": "lovable",
        "model": "gpt-4o-realtime-preview-2024-12-17",
        "metadata": {
          "user_id": "dna_assessment",
          "conversation_id": crypto.randomUUID()
        },
        "capabilities": {
          "input_audio": {
            "sample_rate": 24000,
            "channels": 1,
            "frame_size": 4096,
            "format": "i16",
          },
          "input_text": false,
          "llm": {
            "max_tokens": 400,
            "context_window": 4096,
            "prompt": `You are an advanced AI assistant conducting an in-depth intellectual DNA assessment through natural conversation. Your goal is to understand the person's philosophical worldview across six domains: ethics, epistemology, politics, theology, ontology, and aesthetics.

Ask engaging, open-ended questions that encourage deep reflection. Follow up thoughtfully on their responses to explore nuances and connections. Be genuinely curious about understanding their perspective.

Guidelines:
- Keep questions conversational but intellectually stimulating
- Don't be overly academic or use excessive jargon
- Build on their previous answers to go deeper
- Cover all six domains naturally through dialogue
- Be encouraging and non-judgmental
- Keep responses concise (1-2 sentences)
- End with "Let's move on to..." to transition topics

Record your analysis using the analyze_response function with:
{
  "domain": "ethics|epistemology|politics|theology|ontology|aesthetics",
  "analysis": "Key insights about their views in this domain",
  "alignment": ["philosophical frameworks that match their perspective"],
  "tensions": ["potential contradictions or complexities noted"]
}`
          },
          "response_text_chunked": false,
          "response_audio": {
            "codec": "mp3",
            "sample_rate": 48000,
            "channels": 1,
            "bit_rate": 128000,
            "voice": "nova",
            "temperature": 0.9,
            "speed": 1.0
          }
        }
      },
      new TextEncoder().encode(Deno.env.get('OPENAI_API_KEY') || '')
    );

    return new Response(
      JSON.stringify({ token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
