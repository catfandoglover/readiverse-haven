import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { ChatMessage } from '@/types/chat';

// Define the structure expected by the Gemini API's 'contents' field
interface GeminiContent {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

class AIService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private siteUrl: string = 'readiverse-haven.vercel.app';
  private siteName: string = 'Readiverse Haven';
  private isLoadingKey: boolean = false;

  constructor() {
    this.initializeFromEnvironment();
  }

  private async fetchSecretFromEdgeFunction(): Promise<string | null> {
    try {
      this.isLoadingKey = true;
      
      // Create Supabase client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return null;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Call edge function to get the secret
      const { data, error } = await supabase.functions.invoke('get-gemini-key', {
        method: 'GET'
      });
      
      if (error) {
        console.error('Error fetching API key from edge function:', error);
        return null;
      }
      
      if (data && data.apiKey) {
        return data.apiKey;
      } else {
        console.error('No API key returned from edge function');
        return null;
      }
    } catch (error) {
      console.error('Error in fetchSecretFromEdgeFunction:', error);
      return null;
    } finally {
      this.isLoadingKey = false;
    }
  }

  private async initializeFromEnvironment(): Promise<void> {
    // First try environment variable
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (apiKey && apiKey.trim() !== '') {
      this.initialize(apiKey);
      console.log('AI Service initialized with API key from environment variables');
      return;
    }
    
    console.warn('VITE_GOOGLE_GEMINI_API_KEY not found or empty in environment variables, trying edge function');
    
    // Try to get the key from the edge function
    const secretKey = await this.fetchSecretFromEdgeFunction();
    if (secretKey) {
      this.initialize(secretKey);
      console.log('AI Service initialized with API key from edge function');
      return;
    }
    
    // Fallback for development - REMOVE THIS IN PRODUCTION IF KEY IS ALWAYS PROVIDED VIA ENV/EDGE
    if (import.meta.env.DEV) {
      // Use the previously hardcoded key for development only
      const devKey = 'YOUR_DEV_API_KEY_HERE'; // Replace with your actual dev key or remove
      if (devKey !== 'YOUR_DEV_API_KEY_HERE') { // Basic check to avoid committing a placeholder
         this.initialize(devKey);
         console.log('Running in development mode with provided Gemini API key');
      } else {
         console.error('DEV MODE: Gemini API key placeholder found. Please provide a real key.');
         toast.error('AI service requires API key setup for development.');
         this.initialized = false;
      }
    } else {
      console.error('Could not get Gemini API key from any source');
      toast.error('AI service initialization failed. Please check your API key configuration.');
      this.initialized = false;
    }
  }

  // Initialize the AI service with an API key
  initialize(apiKey: string): void {
    try {
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('Invalid API key provided');
      }
      
      this.apiKey = apiKey;
      this.initialized = true;
      console.log('AI Service initialized with Gemini successfully');
    } catch (error) {
      console.error('Error initializing AI service:', error);
      this.initialized = false;
    }
  }

  // Check if the service is initialized
  isInitialized(): boolean {
    return this.initialized && this.apiKey.trim() !== '';
  }

  // Generate a response from the AI using Gemini
  async generateResponse(
    systemPrompt: string,
    messages: ChatMessage[]
  ): Promise<string> {
    if (!this.isInitialized()) {
      console.error('AI service not initialized or API key is missing.');
      // Throw an error or return a specific error message string
      // Throwing might be better for the caller (useVirgilChat) to handle
      // throw new Error("AI service is not initialized.");
      return "Error: AI service is not initialized. Please check configuration.";
    }
    if (this.isLoadingKey) {
       console.warn('AI service is still loading the API key.');
       return "Error: AI service is initializing. Please try again shortly.";
    }

    try {
      // Format message history for Gemini API
      const formattedMessages = this._formatMessagesForGemini(messages);

      // Create request payload for Gemini
      // Including systemPrompt via system_instruction if the API supports it
      const requestPayload = {
        contents: formattedMessages,
        system_instruction: {
           parts: [{ text: systemPrompt }]
        },
        generation_config: {
          temperature: 0.7, // Keep previous settings, adjust as needed
          top_p: 0.95,
          top_k: 40,
          max_output_tokens: 1000, // Keep previous settings, adjust as needed
        }
      };

      // console.log('Gemini request payload:', JSON.stringify(requestPayload, null, 2)); // More readable log

      // Make API request to Gemini
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", response.status, errorData);
        // Provide more specific error feedback if possible
        const errorDetail = errorData?.error?.message || JSON.stringify(errorData);
        throw new Error(`Gemini API Error (${response.status}): ${errorDetail}`);
      }

      const responseData = await response.json();
      // console.log("Gemini response:", JSON.stringify(responseData, null, 2)); // More readable log

      // Extract the response text safely
      const responseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof responseText !== 'string') {
         console.error("Failed to extract valid text from Gemini response:", responseData);
        throw new Error('Invalid response format from Gemini API');
      }

      return responseText;

    } catch (error) {
      console.error('Error generating AI response:', error);
      // Return a generic error message or re-throw for the caller to handle
      return "I'm sorry, an unexpected error occurred while generating a response. Please try again.";
    }
  }

  // Format messages for Gemini API
  // Takes ChatMessage[] and returns GeminiContent[]
  private _formatMessagesForGemini(messages: ChatMessage[]): GeminiContent[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // Map 'assistant' to 'model'
      parts: [{ text: msg.content }]
    }));
  }

  // _truncateText is removed as per requirements
  // _blobToBase64 is removed as per requirements
}

// Create a singleton instance
export const aiService = new AIService();
export default aiService;
