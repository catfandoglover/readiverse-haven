
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
        instructions: "You are an AI assistant conducting an Intellectual DNA Assessment."
      }),
    });

    const responseText = await response.text();
    console.log('OpenAI Response:', responseText);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed response data:', data);

    // Check if we have the client_secret in the response
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
