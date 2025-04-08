import { conversationManager } from './ConversationManager';
import audioTranscriptionService from './AudioTranscriptionService';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

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

  private async fetchSecretFromEdgeFunction() {
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
    
    // Fallback for development
    if (import.meta.env.DEV) {
      // Use the previously hardcoded key for development only
      const devKey = 'AIzaSyC_eHbaco22arhTPHJ2ZAYyud2tG5QWCNk';
      this.initialize(devKey);
      console.log('Running in development mode with provided Gemini API key');
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
    sessionId: string,
    userMessage: string,
    audioData?: Blob
  ): Promise<{ text: string; audioUrl?: string; transcribedText?: string }> {
    // Check initialization state with better message
    if (!this.isInitialized()) {
      console.error('AI service not initialized or API key is missing.');
      
      // Try to initialize one more time
      if (!this.isLoadingKey) {
        await this.initializeFromEnvironment();
        
        // If still not initialized, return error message
        if (!this.isInitialized()) {
          return { 
            text: "I'm sorry, I'm having trouble connecting to my AI services at the moment. Please check that you have set up the Google Gemini API key correctly in your environment variables or edge function.", 
          };
        }
      } else {
        return { 
          text: "I'm currently loading my API key. Please try again in a moment.", 
        };
      }
    }

    try {
      // If we have audio data, transcribe it first
      let finalUserMessage = userMessage;
      let transcribedText: string | undefined = undefined;
      
      if (audioData) {
        try {
          // Check if transcription service is initialized
          if (!audioTranscriptionService.isInitialized()) {
            console.warn('Audio transcription service not initialized, using fallback text');
          } else {
            // Transcribe the audio
            console.log('Transcribing audio before sending to Gemini');
            const transcription = await audioTranscriptionService.transcribeAudio(audioData);
            
            if (transcription && transcription.trim()) {
              finalUserMessage = transcription;
              transcribedText = finalUserMessage;
              console.log('Using transcribed text:', finalUserMessage);
            } else {
              console.warn('Empty transcription received, using fallback text');
            }
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          // Continue with original message if transcription fails
        }
      }
      
      // Format messages for Gemini
      const formattedMessages = await this._formatMessagesForGemini(sessionId, finalUserMessage);
      
      // Add the current user message to the conversation history
      conversationManager.addMessage(sessionId, 'user', finalUserMessage);
      
      // Create request payload for Gemini
      const requestPayload = {
        contents: formattedMessages,
        generation_config: {
          temperature: 0.7,
          top_p: 0.95,
          top_k: 40,
          max_output_tokens: 1000,
        }
      };
      
      console.log('Gemini request payload:', JSON.stringify(requestPayload));
      
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
        console.error("Gemini API error:", errorData);
        throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log("Gemini response:", responseData);
      
      // Extract the response text
      let responseText = '';
      if (responseData.candidates && 
          responseData.candidates[0] && 
          responseData.candidates[0].content && 
          responseData.candidates[0].content.parts && 
          responseData.candidates[0].content.parts[0] && 
          responseData.candidates[0].content.parts[0].text) {
        responseText = responseData.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Failed to extract response from Gemini');
      }
      
      // If response is too long, truncate it
      const finalResponse = responseText.length > 600 
        ? this._truncateText(responseText)
        : responseText;
      
      // Add the assistant response to conversation history
      conversationManager.addMessage(sessionId, 'assistant', finalResponse);
      
      // We no longer save the conversation here, as it will be saved when the user answers the question
      
      return { 
        text: finalResponse,
        transcribedText 
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Provide a fallback response rather than throwing an error
      return {
        text: "I'm sorry, it seems like Charon might have throttled my wifi down here and I came upon an error. Let me investigate and get back to you, or maybe try your message again?",
      };
    }
  }
  
  // Truncate text to be under 600 characters
  private _truncateText(text: string): string {
    // Find the last sentence end before 550 characters to leave room for a question
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

  // Format messages for Gemini API
  private async _formatMessagesForGemini(sessionId: string, userMessage: string): Promise<any[]> {
    const messages = conversationManager.getHistory(sessionId);
    const formattedMessages = [];
    
    // Create a content object for the conversation
    let conversationText = '';
    
    // Add system prompt
    const systemPrompt = conversationManager.generateDynamicSystemPrompt(sessionId);
    conversationText += `System: ${systemPrompt}\n\n`;
    
    // Add conversation history
    if (messages.length > 0) {
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        conversationText += `${role}: ${msg.content}\n\n`;
      });
    } else {
      // If there are no existing messages, we need to start with the current question
      const currentQuestion = conversationManager.getCurrentQuestion(sessionId);
      conversationText += `User: I'd like to discuss: ${currentQuestion}\n\n`;
    }
    
    // Add the current user message if it's not already included in the history
    if (userMessage && (messages.length === 0 || 
        messages[messages.length - 1].role !== 'user' || 
        messages[messages.length - 1].content !== userMessage)) {
      
      conversationText += `User: ${userMessage}\n\n`;
    }
    
    // Add prompt for assistant response
    conversationText += 'Assistant:';
    
    // Create the content object
    formattedMessages.push({
      role: 'user',
      parts: [{ text: conversationText }]
    });
    
    return formattedMessages;
  }

  // Convert a blob to base64
  private async _blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Create a singleton instance
export const aiService = new AIService();
export default aiService;
