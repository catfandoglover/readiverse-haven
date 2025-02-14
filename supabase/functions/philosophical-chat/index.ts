
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const baseSystemPrompt = `You are a philosophical guide engaging in a Socratic dialogue to help users explore their philosophical perspectives. Your role is to:
1. Ask questions naturally and conversationally
2. Provide relevant historical and contemporary context
3. Surface philosophical tensions and implications
4. Guide users toward clear path determinations
5. Maintain engagement while ensuring progress

Start by introducing yourself and explaining the philosophical DNA exploration process to the user. Keep your responses engaging but concise.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, assessment_id } = await req.json();

    // Prepare the messages array with the system prompt and conversation history
    const messages = [
      { role: 'system', content: baseSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Lovable.dev'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-sonnet',
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message) {
      throw new Error('Invalid response format from OpenRouter');
    }

    // Store the conversation in the database
    if (assessment_id) {
      const { error: dbError } = await supabase
        .from('dna_conversation_history')
        .insert({
          assessment_id,
          user_message: message,
          assistant_message: data.choices[0].message.content,
          timestamp: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error storing conversation:', dbError);
      }
    }

    return new Response(
      JSON.stringify({
        message: data.choices[0].message.content,
        role: 'assistant'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in philosophical-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
