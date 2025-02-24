const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config({ path: '../.env' });

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
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// Map to store WebSocket connections per client
const clientGeminiSockets = new Map();

function createGeminiSocket(socket) {
  console.log(`Creating new Gemini socket for client: ${socket.id}`);
  
  const geminiSocket = new WebSocket(`${GEMINI_WS_URL}?key=${GEMINI_API_KEY}`);
  
  geminiSocket.onopen = () => {
    console.log(`Connected to Gemini API for client: ${socket.id}`);
    
    // Initialize with Gemini configuration based exactly on GitHub example
    const setupMessage = {
      setup: {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: "audio",
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede"
              }
            }
          }
        },
        systemInstruction: {
          parts: [{
            text: "You are my helpful assistant."
          }]
        }
      }
    };
    
    try {
      geminiSocket.send(JSON.stringify(setupMessage));
      console.log('Setup message sent successfully');
    } catch (error) {
      console.error('Error sending setup message:', error);
    }
  };
  
  return geminiSocket;
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  let geminiSocket = createGeminiSocket(socket);
  clientGeminiSockets.set(socket.id, geminiSocket);
  
  // Handle messages from Gemini
  geminiSocket.onmessage = (event) => {
    try {
      if (event.data instanceof Buffer || event.data instanceof ArrayBuffer) {
        console.log(`Received audio data from Gemini for client ${socket.id}`);
        io.to(socket.id).emit('geminiAudio', Buffer.from(event.data).toString('base64'));
      } else {
        const message = JSON.parse(event.data);
        console.log('Received message from Gemini:', message);
        
        // Check for setupComplete message
        if (message.setupComplete) {
          console.log('Setup completed successfully');
        }
        
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
  geminiSocket.onclose = (event) => {
    console.log(`Gemini API WebSocket closed for client ${socket.id}. Code: ${event.code}, Reason: ${event.reason}`);
    
    // Attempt to reconnect
    console.log('Attempting to reconnect...');
    geminiSocket = createGeminiSocket(socket);
    clientGeminiSockets.set(socket.id, geminiSocket);
  };
  
  // Handle audio data from client
  socket.on('audioData', async (data) => {
    console.log(`Received audio data from client ${socket.id}`);
    console.log('WebSocket state:', geminiSocket.readyState);
    
    // If socket is closed, try to reconnect
    if (geminiSocket.readyState === WebSocket.CLOSED) {
      console.log('Socket is closed, creating new connection...');
      geminiSocket = createGeminiSocket(socket);
      clientGeminiSockets.set(socket.id, geminiSocket);
      
      // Wait for connection to be established
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (geminiSocket.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
      });
    }

    if (geminiSocket.readyState === WebSocket.OPEN) {
      console.log('Sending audio data to Gemini');
      const messageToSend = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm;rate=16000',
            data: data.audioBase64
          }]
        }
      };
      
      try {
        geminiSocket.send(JSON.stringify(messageToSend));
        console.log('Audio data sent successfully');
      } catch (error) {
        console.error('Error sending audio data:', error);
      }
    } else {
      console.log('WebSocket not ready. State:', geminiSocket.readyState);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
