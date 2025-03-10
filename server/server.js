const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');
const AWS = require('aws-sdk');
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

// Configure environment variables
const GEMINI_API_KEY = process.env.VITE_GOOGLE_GEMINI_API_KEY;
const AWS_ACCESS_KEY_ID = process.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.VITE_AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.VITE_AWS_REGION || 'us-east-1';
const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// Set up AWS Polly client
const polly = new AWS.Polly({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});

// Map to store conversation data per session
const conversations = new Map();
const clientGeminiSockets = new Map();

// Function to generate a dynamic system prompt
function generateSystemPrompt(sessionId, currentQuestion) {
  const conversation = conversations.get(sessionId) || { messages: [], questionPath: [] };
  
  // Get a random greeting
  const greeting = getRandomGreeting();
  
  // Base system prompt
  let prompt = `
You are Virgil, an AI assistant designed to guide users through philosophical discussions. 

Your ONLY TASK is to help the user thoughtfully navigate the following subjective philosophical question:

"${currentQuestion}"

When interacting with users, adhere to these guidelines:
- Brief, focused responses (1-3 sentences)
- Warm, thoughtful, and accessible tone
- Express complex ideas with straightforward language
- Ask thoughtful questions that invite reflection
- NEVER exceed 600 characters in your response

Initial response: "${greeting}"

Response Format:
- Use 2-5 short, complete sentences only
- Avoid bullet points and numbered lists
- Prioritize brevity over comprehensiveness
`;

  // Add question path history if available
  if (conversation.questionPath && conversation.questionPath.length > 0) {
    prompt += "\n\nUser has answered previous questions as follows:\n";
    
    for (const { questionId, answer } of conversation.questionPath) {
      prompt += `- Question ID: "${questionId}"\n  Answer: ${answer}\n`;
    }
  }
  
  return prompt;
}

// Function to get a random greeting
function getRandomGreeting() {
  const greetings = [
    "Tell me more",
    "What's on your mind?",
    "What's your perspective on this?",
    "What comes to mind as you reflect on this question?", 
    "How do you find yourself approaching this question?", 
    "What elements of this question resonate most with you?",
    "What aspects would you like to explore further?",
    "Which considerations feel most significant to you?",
    "How does this question connect with your own experience?",
    "What dimensions of this question intrigue you?"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Function to synthesize speech using AWS Polly
async function synthesizeSpeech(text) {
  try {
    const params = {
      OutputFormat: 'mp3',
      SampleRate: '16000',
      Text: text,
      TextType: 'text',
      VoiceId: 'Arthur', // British male voice
      Engine: 'neural'
    };
    
    return new Promise((resolve, reject) => {
      polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
          console.error('Error synthesizing speech:', err);
          reject(err);
          return;
        }
        
        // Convert audio data to base64
        const audioBase64 = data.AudioStream.toString('base64');
        resolve(audioBase64);
      });
    });
  } catch (error) {
    console.error('Error in synthesizeSpeech:', error);
    throw error;
  }
}

// Function to create a Gemini WebSocket for a client
function createGeminiSocket(socket, sessionId, currentQuestion) {
  console.log(`Creating new Gemini socket for client: ${socket.id}, session: ${sessionId}`);
  
  const geminiSocket = new WebSocket(`${GEMINI_WS_URL}?key=${GEMINI_API_KEY}`);
  
  geminiSocket.onopen = () => {
    console.log(`Connected to Gemini API for client: ${socket.id}`);
    
    // Get or create system prompt
    const systemPrompt = generateSystemPrompt(sessionId, currentQuestion);
    
    // Initialize with Gemini configuration
    const setupMessage = {
      setup: {
        model: "models/gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: "audio",
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.95,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Florian" // More philosophical male voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{
            text: systemPrompt
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

// Shorten text to be under 600 characters
function shortenText(text) {
  if (text.length <= 600) return text;
  
  // Find the last sentence end before 550 characters
  const lastEnd = text.substring(0, 550).lastIndexOf('.');
  if (lastEnd === -1) {
    // No sentence end found, just truncate
    return text.substring(0, 550) + "... What are your thoughts on this?";
  } else {
    // Add a follow-up question if there isn't one
    const truncated = text.substring(0, lastEnd + 1);
    if (!truncated.includes('?')) {
      return truncated + " What do you think about this perspective?";
    }
    return truncated;
  }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Initialize session and Gemini socket on new connection
  socket.on('initSession', async (data) => {
    const { sessionId, currentQuestion } = data;
    console.log(`Initializing session: ${sessionId} with question: ${currentQuestion}`);
    
    // Initialize conversation data if needed
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, {
        messages: [],
        questionPath: [],
        currentQuestion
      });
    } else {
      // Update current question
      const conversation = conversations.get(sessionId);
      conversation.currentQuestion = currentQuestion;
      conversations.set(sessionId, conversation);
    }
    
    // Create Gemini socket for this session
    let geminiSocket = createGeminiSocket(socket, sessionId, currentQuestion);
    clientGeminiSockets.set(socket.id, { geminiSocket, sessionId });
    
    // Handle messages from Gemini
    geminiSocket.onmessage = async (event) => {
      try {
        if (event.data instanceof Buffer || event.data instanceof ArrayBuffer) {
          console.log(`Received audio data from Gemini for client ${socket.id}`);
          // Convert binary data to base64
          const audioBase64 = Buffer.from(event.data).toString('base64');
          io.to(socket.id).emit('aiAudio', { sessionId, audioBase64 });
        } else {
          const message = JSON.parse(event.data);
          console.log('Received message from Gemini:', message);
          
          // Check for setupComplete message
          if (message.setupComplete) {
            console.log('Setup completed successfully');
            return;
          }
          
          // Extract text content from the response
          let responseText = '';
          if (message.serverResponse?.responseText?.text) {
            responseText = message.serverResponse.responseText.text;
          } else if (message.serverResponse?.candidateResponses?.[0]?.content?.parts) {
            const parts = message.serverResponse.candidateResponses[0].content.parts;
            for (const part of parts) {
              if (part.text) {
                responseText += part.text;
              }
            }
          }
          
          if (responseText) {
            // Shorten text if too long
            if (responseText.length > 600) {
              responseText = shortenText(responseText);
            }
            
            // Store in conversation history
            const conversation = conversations.get(sessionId);
            if (conversation) {
              conversation.messages.push({
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
              });
              conversations.set(sessionId, conversation);
            }
            
            // Try to generate Polly audio as backup
            try {
              const audioBase64 = await synthesizeSpeech(responseText);
              io.to(socket.id).emit('aiResponse', { 
                sessionId, 
                text: responseText,
                audioBase64
              });
            } catch (error) {
              console.error('Error with Polly, using only text response:', error);
              io.to(socket.id).emit('aiResponse', { 
                sessionId, 
                text: responseText 
              });
            }
          }
        }
      } catch (err) {
        console.error('Error handling Gemini message:', err);
      }
    };

    // Handle errors from Gemini
    geminiSocket.onerror = (error) => {
      console.error(`Gemini API WebSocket Error for client ${socket.id}:`, error);
      io.to(socket.id).emit('error', { 
        sessionId, 
        message: `Gemini API WebSocket Error: ${error.message}` 
      });
    };
    
    // Handle WebSocket close
    geminiSocket.onclose = (event) => {
      console.log(`Gemini API WebSocket closed for client ${socket.id}. Code: ${event.code}, Reason: ${event.reason}`);
      
      // Attempt to reconnect
      console.log('Attempting to reconnect...');
      const currentConversation = conversations.get(sessionId);
      const currentQuestion = currentConversation ? currentConversation.currentQuestion : 'Unknown question';
      
      geminiSocket = createGeminiSocket(socket, sessionId, currentQuestion);
      clientGeminiSockets.set(socket.id, { geminiSocket, sessionId });
    };
    
    // Send success response
    socket.emit('sessionInitialized', { sessionId });
  });
  
  // Handle text message from client
  socket.on('sendMessage', async (data) => {
    const { sessionId, text } = data;
    console.log(`Received text message from client ${socket.id} in session ${sessionId}: ${text}`);
    
    // Store in conversation history
    const conversation = conversations.get(sessionId);
    if (conversation) {
      conversation.messages.push({
        role: 'user',
        content: text,
        timestamp: new Date()
      });
      conversations.set(sessionId, conversation);
    }
    
    // Get socket info
    const socketInfo = clientGeminiSockets.get(socket.id);
    if (!socketInfo || !socketInfo.geminiSocket) {
      console.error('No Gemini socket found for this client');
      socket.emit('error', { 
        sessionId, 
        message: 'No active Gemini connection. Please try again.' 
      });
      return;
    }
    
    const { geminiSocket } = socketInfo;
    
    // If socket is closed, try to reconnect
    if (geminiSocket.readyState === WebSocket.CLOSED) {
      console.log('Socket is closed, creating new connection...');
      const currentConversation = conversations.get(sessionId);
      const currentQuestion = currentConversation ? currentConversation.currentQuestion : 'Unknown question';
      
      const newGeminiSocket = createGeminiSocket(socket, sessionId, currentQuestion);
      clientGeminiSockets.set(socket.id, { geminiSocket: newGeminiSocket, sessionId });
      
      // Wait for connection to be established
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (newGeminiSocket.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
      });
      
      // Send message to new socket
      if (newGeminiSocket.readyState === WebSocket.OPEN) {
        const messageToSend = {
          clientContent: {
            turns: [{
              role: "user",
              parts: [{
                text: text
              }]
            }],
            turnComplete: true
          }
        };
        
        try {
          newGeminiSocket.send(JSON.stringify(messageToSend));
        } catch (error) {
          console.error('Error sending message to new socket:', error);
        }
      }
    } else if (geminiSocket.readyState === WebSocket.OPEN) {
      // Send message to existing socket
      const messageToSend = {
        clientContent: {
          turns: [{
            role: "user",
            parts: [{
              text: text
            }]
          }],
          turnComplete: true
        }
      };
      
      try {
        geminiSocket.send(JSON.stringify(messageToSend));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
  
  // Handle audio data from client
  socket.on('sendAudio', async (data) => {
    const { sessionId, audioBase64 } = data;
    console.log(`Received audio data from client ${socket.id} in session ${sessionId}`);
    
    // Store in conversation history
    const conversation = conversations.get(sessionId);
    if (conversation) {
      conversation.messages.push({
        role: 'user',
        content: 'Voice message',
        timestamp: new Date()
      });
      conversations.set(sessionId, conversation);
    }
    
    // Get socket info
    const socketInfo = clientGeminiSockets.get(socket.id);
    if (!socketInfo || !socketInfo.geminiSocket) {
      console.error('No Gemini socket found for this client');
      socket.emit('error', { 
        sessionId, 
        message: 'No active Gemini connection. Please try again.' 
      });
      return;
    }
    
    const { geminiSocket } = socketInfo;
    
    // If socket is closed, try to reconnect
    if (geminiSocket.readyState === WebSocket.CLOSED) {
      console.log('Socket is closed, creating new connection...');
      const currentConversation = conversations.get(sessionId);
      const currentQuestion = currentConversation ? currentConversation.currentQuestion : 'Unknown question';
      
      const newGeminiSocket = createGeminiSocket(socket, sessionId, currentQuestion);
      clientGeminiSockets.set(socket.id, { geminiSocket: newGeminiSocket, sessionId });
      
      // Wait for connection to be established
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (newGeminiSocket.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
      });
      
      // Send audio to new socket
      if (newGeminiSocket.readyState === WebSocket.OPEN) {
        const messageToSend = {
          realtimeInput: {
            mediaChunks: [{
              mimeType: 'audio/webm',
              data: audioBase64
            }]
          }
        };
        
        try {
          newGeminiSocket.send(JSON.stringify(messageToSend));
        } catch (error) {
          console.error('Error sending audio to new socket:', error);
        }
      }
    } else if (geminiSocket.readyState === WebSocket.OPEN) {
      // Send audio to existing socket
      const messageToSend = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/webm',
            data: audioBase64
          }]
        }
      };
      
      try {
        geminiSocket.send(JSON.stringify(messageToSend));
      } catch (error) {
        console.error('Error sending audio data:', error);
      }
    }
  });
  
  // Handle chat history request
  socket.on('getChatHistory', (data) => {
    const { sessionId } = data;
    const conversation = conversations.get(sessionId) || { messages: [] };
    socket.emit('chatHistory', { 
      sessionId, 
      messages: conversation.messages 
    });
  });
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const socketInfo = clientGeminiSockets.get(socket.id);
    if (socketInfo && socketInfo.geminiSocket) {
      socketInfo.geminiSocket.close();
      clientGeminiSockets.delete(socket.id);
    }
  });
});

// Simple endpoint to test if server is running
app.get('/', (req, res) => {
  res.send('WebSocket Server is running for AI chat!');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
