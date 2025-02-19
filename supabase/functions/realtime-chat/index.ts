
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to OpenAI's Realtime API
    const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17");
    
    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
      
      // Send initial session configuration
      openAISocket.send(JSON.stringify({
        "event_id": "event_123",
        "type": "session.update",
        "session": {
          "modalities": ["text", "audio"],
          "instructions": `You are an AI assistant conducting an Intellectual DNA Assessment. Your goal is to understand the user's philosophical positions across six categories: Ethics, Epistemology, Politics, Theology, Ontology, and Aesthetics.

          For each category, you need to determine where they fall on our decision tree by asking relevant questions. Be conversational and natural, but make sure to get clear answers that map to our tree structure.
          
          Keep track of their answers and map them to our decision tree paths. Each answer should be clearly marked as either 'A' or 'B' for our tracking.`,
          "voice": "alloy",
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
          "tools": [
            {
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
            }
          ],
          "tool_choice": "auto",
          "temperature": 0.7
        }
      }));
    };

    // Handle messages from the client
    socket.onmessage = async (event) => {
      console.log("Received from client:", event.data);
      openAISocket.send(event.data);
    };

    // Forward OpenAI responses to the client
    openAISocket.onmessage = (event) => {
      console.log("Received from OpenAI:", event.data);
      socket.send(event.data);
    };

    // Handle WebSocket errors
    socket.onerror = (e) => console.error("WebSocket error:", e);
    openAISocket.onerror = (e) => console.error("OpenAI WebSocket error:", e);

    // Handle WebSocket closures
    socket.onclose = () => {
      console.log("Client disconnected");
      openAISocket.close();
    };
    
    openAISocket.onclose = () => {
      console.log("OpenAI disconnected");
      socket.close();
    };

    return response;
  } catch (error) {
    console.error('Error in realtime-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
