
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Edge Function starting...");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";
    console.log("Received request with upgrade header:", upgradeHeader);

    if (upgradeHeader.toLowerCase() !== "websocket") {
      console.log("Not a WebSocket request, returning 400");
      return new Response("Expected WebSocket connection", { 
        status: 400,
        headers: corsHeaders
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set");
      throw new Error('OPENAI_API_KEY is not set');
    }

    // First upgrade the connection to WebSocket
    console.log("Upgrading to WebSocket connection...");
    const { socket, response } = Deno.upgradeWebSocket(req);

    // Send initial connected message to client
    socket.onopen = () => {
      console.log("Client WebSocket connected");
      socket.send(JSON.stringify({ type: 'status', message: 'Connected to server' }));
    };

    console.log("Requesting OpenAI session token...");
    // Request an ephemeral token from OpenAI
    const tokenResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are an AI assistant conducting an Intellectual DNA Assessment.`
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to get OpenAI session token:", errorText);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to initialize OpenAI session' 
        }));
      }
      throw new Error(`Failed to get session token: ${errorText}`);
    }

    const sessionData = await tokenResponse.json();
    console.log("OpenAI session created successfully");

    // Connect to OpenAI's Realtime API
    console.log("Connecting to OpenAI WebSocket...");
    const openAIUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17&token=${sessionData.token}`;
    console.log("Attempting to connect to OpenAI...");
    
    const openAISocket = new WebSocket(openAIUrl);
    
    openAISocket.onopen = () => {
      console.log("OpenAI WebSocket connected");
      socket.send(JSON.stringify({ type: 'status', message: 'Connected to OpenAI' }));
      
      const sessionConfig = {
        "event_id": crypto.randomUUID(),
        "type": "session.update",
        "session": {
          "modalities": ["text", "audio"],
          "input_audio_format": "pcm16",
          "output_audio_format": "pcm16",
          "input_audio_transcription": {
            "model": "whisper-1"
          },
          "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 1000
          },
          "tools": [{
            "type": "function",
            "name": "record_dna_response",
            "description": "Record a response in the DNA assessment tree",
            "parameters": {
              "type": "object",
              "properties": {
                "category": {
                  "type": "string",
                  "enum": ["ETHICS", "EPISTEMOLOGY", "POLITICS", "THEOLOGY", "ONTOLOGY", "AESTHETICS"]
                },
                "tree_position": { "type": "string" },
                "answer": {
                  "type": "string",
                  "enum": ["A", "B"]
                }
              },
              "required": ["category", "tree_position", "answer"]
            }
          }],
          "tool_choice": "auto",
          "temperature": 0.7
        }
      };

      console.log("Sending session configuration...");
      openAISocket.send(JSON.stringify(sessionConfig));
    };

    // Handle messages from the client
    socket.onmessage = (event) => {
      try {
        console.log("Received from client:", event.data);
        if (openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        } else {
          console.error("OpenAI WebSocket not ready, state:", openAISocket.readyState);
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'OpenAI connection not ready' 
          }));
        }
      } catch (error) {
        console.error("Error handling client message:", error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error processing message' 
        }));
      }
    };

    // Forward OpenAI responses to the client
    openAISocket.onmessage = (event) => {
      try {
        console.log("Received from OpenAI:", event.data);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      } catch (error) {
        console.error("Error handling OpenAI message:", error);
      }
    };

    // Handle WebSocket errors
    socket.onerror = (e) => {
      console.error("Client WebSocket error:", e);
      try {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Connection error occurred'
        }));
      } catch (err) {
        console.error('Failed to send error to client:', err);
      }
    };

    openAISocket.onerror = (e) => {
      console.error("OpenAI WebSocket error:", e);
      try {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'OpenAI connection error'
        }));
      } catch (err) {
        console.error('Failed to send OpenAI error to client:', err);
      }
    };

    // Handle WebSocket closures
    socket.onclose = (event) => {
      console.log("Client WebSocket closed with code:", event.code, "reason:", event.reason);
      openAISocket.close();
    };
    
    openAISocket.onclose = (event) => {
      console.log("OpenAI WebSocket closed with code:", event.code, "reason:", event.reason);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'OpenAI connection closed' 
        }));
        socket.close();
      }
    };

    return response;
  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
