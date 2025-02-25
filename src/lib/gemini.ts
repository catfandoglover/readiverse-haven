import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing VITE_GOOGLE_GEMINI_API_KEY environment variable');
}

// Configure the client with the flash model for real-time interaction
export const genai = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getMultimodalModel = () => {
  return genai.getGenerativeModel({ 
    model: "gemini-pro",  // Using gemini-pro as it's the stable model for chat
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
    }
  });
};

// Create a chat session
export const startChat = async (model: any) => {
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2048,
    },
  });
}; 
