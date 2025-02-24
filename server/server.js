const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const GEMINI_API_KEY = process.env.VITE_GOOGLE_GEMINI_API_KEY;
const model = `models/gemini-2.0-flash-001`;
const GEMINI_API_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// Map to store WebSocket connections per client
const clientGeminiSockets = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Create a WebSocket connection to Gemini for this client
  const geminiSocket = new WebSocket(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
  
  // Store the WebSocket connection
  clientGeminiSockets.set(socket.id, geminiSocket);
  
  // Handle WebSocket open event
  geminiSocket.onopen = () => {
    console.log(`Connected to Gemini API for client: ${socket.id}`);
    
    // Initialize Gemini with configuration
    const setupMessage = {
      setup: {
        model: model,
        generationConfig: {
          responseModalities: ["TEXT", "AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore"  // Available voices: Aoede, Charon, Fenrir, Kore, Puck
              }
            }
          }
        }
      }
    };
    
    geminiSocket.send(JSON.stringify(setupMessage));
  };
  
  // Handle messages from Gemini
  geminiSocket.onmessage = (event) => {
    try {
      // Check if it's binary data (audio)
      if (event.data instanceof Buffer || event.data instanceof ArrayBuffer) {
        console.log(`Sending Gemini Audio data to client ${socket.id}`);
        io.to(socket.id).emit('geminiAudio', Buffer.from(event.data).toString('base64'));
      } else {
        // Parse JSON response
        const message = JSON.parse(event.data);
        io.to(socket.id).emit('message', message);
      }
    } catch (err) {
      console.error('Error handling Gemini message:', err);
    }
  };
  
  // Handle errors
  geminiSocket.onerror = (error) => {
    console.error(`Gemini API WebSocket Error for client ${socket.id}:`, error);
    io.to(socket.id).emit('error', `Gemini API WebSocket Error: ${error.message}`);
  };
  
  // Handle WebSocket close
  geminiSocket.onclose = () => {
    console.log(`Gemini API WebSocket closed for client ${socket.id}`);
    clientGeminiSockets.delete(socket.id);
  };
  
  // Handle messages from the client
  socket.on('audioData', (data) => {
    if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
      // Format and send audio data to Gemini
      const messageToSend = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm;rate=16000',
            data: data.audioBase64
          }]
        }
      };
      
      geminiSocket.send(JSON.stringify(messageToSend));
    }
  });
  
  // Handle text input from client
  socket.on('textInput', (data) => {
    if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
      const messageToSend = {
        clientContent: {
          turns: [{
            role: "user",
            parts: [{
              text: data.text
            }]
          }],
          turnComplete: true
        }
      };
      
      geminiSocket.send(JSON.stringify(messageToSend));
    }
  });
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const geminiSocket = clientGeminiSockets.get(socket.id);
    if (geminiSocket) {
      geminiSocket.close();
      clientGeminiSockets.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
