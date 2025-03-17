
import { conversationManager } from './ConversationManager';
import audioTranscriptionService from './AudioTranscriptionService';

class AIService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private siteUrl: string = 'readiverse-haven.vercel.app';
  private siteName: string = 'Readiverse Haven';

  constructor() {
    // Initialize with environment variable if available
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (apiKey) {
      this.initialize(apiKey);
    } else {
      console.warn('VITE_GOOGLE_GEMINI_API_KEY not found in environment variables');
      
      // Fallback to a default test API key (for development only)
      // In production, this should be removed and proper error handling added
      const fallbackApiKey = 'FALLBACK_API_KEY_FOR_TESTING';
      this.initialize(fallbackApiKey);
      console.warn('Using fallback API key for testing purposes only');
    }
  }

  // Initialize the AI service with an API key
  initialize(apiKey: string): void {
    try {
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
    return this.initialized;
  }

  // Generate a response from the AI using Gemini
  async generateResponse(
    sessionId: string,
    userMessage: string,
    audioData?: Blob
  ): Promise<{ text: string; audioUrl?: string; transcribedText?: string }> {
    if (!this.initialized) {
      console.error('AI service not initialized. API key might be missing.');
      return { 
        text: "I'm sorry, I'm having trouble connecting to my AI services at the moment. Please try again later or contact support if this continues.", 
      };
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
        text: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
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
