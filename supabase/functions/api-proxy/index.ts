import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  Engine,
  VoiceId,
  TextType
} from 'npm:@aws-sdk/client-polly';
import { getSynthesizeSpeechUrl } from 'npm:@aws-sdk/polly-request-presigner';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { service, action, params } = await req.json();
    
    console.log(`Processing request: service=${service}, action=${action}`);
    
    switch (service) {
      case 'polly':
        return await handlePollyRequest(action, params);
      case 'gemini':
        return await handleGeminiRequest(action, params);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handlePollyRequest(action, params) {
  try {
    if (action !== 'synthesize') {
      throw new Error(`Unknown Polly action: ${action}`);
    }
    
    const { text } = params;
    if (!text) throw new Error('No text provided');
    
    // Get AWS credentials
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION');
    
    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error('Missing AWS credentials');
    }
    
    console.log(`AWS credentials loaded, region: ${region}`);
    
    // Initialize Polly client and get URL
    const pollyClient = new PollyClient({ region, credentials: { accessKeyId, secretAccessKey } });
    const url = await getSynthesizeSpeechUrl({
      client: pollyClient,
      params: {
        OutputFormat: OutputFormat.MP3,
        SampleRate: "16000",
        Text: text,
        TextType: TextType.TEXT,
        VoiceId: VoiceId.Arthur,
        Engine: Engine.NEURAL
      }
    });
    
    console.log(`Generated Polly URL successfully`);
    
    return new Response(
      JSON.stringify({ url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handlePollyRequest:', error);
    throw error;
  }
}

async function handleGeminiRequest(action, params) {
  try {
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) throw new Error('Missing Gemini API key');
    
    console.log(`Gemini API key loaded, action: ${action}`);
    
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    let requestPayload;
    
    switch (action) {
      case 'chat':
        const { messages, temperature = 0.7, maxTokens = 1000 } = params;
        if (!messages) throw new Error('No messages provided');
        
        requestPayload = {
          contents: messages,
          generation_config: {
            temperature,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: maxTokens,
          }
        };
        break;
        
      case 'transcribe':
        const { audio, mimeType = 'audio/webm' } = params;
        if (!audio) throw new Error('No audio provided');
        
        requestPayload = {
          contents: [{
            parts: [
              { text: "Please transcribe this audio recording accurately. DO NOT ADD any additional text or commentary:" },
              { inline_data: { mime_type: mimeType, data: audio } }
            ]
          }],
          generation_config: {
            temperature: 0.2,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 1024,
          }
        };
        break;
        
      default:
        throw new Error(`Unknown Gemini action: ${action}`);
    }
    
    console.log(`Making request to Gemini API for ${action}`);
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      
      let errorData = null;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Not JSON, use errorText as is
      }
      
      return new Response(
        JSON.stringify({
          error: `Gemini API error: ${response.status}`,
          details: errorData || errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }
    
    const responseData = await response.json();
    console.log(`Successfully received response from Gemini API for ${action}`);
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handleGeminiRequest:', error);
    throw error;
  }
} 