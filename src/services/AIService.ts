import { conversationManager } from './ConversationManager';
import audioTranscriptionService from './AudioTranscriptionService';

class AIService {
  private initialized: boolean = true; // Always initialized since we're using serverless functions
  private apiEndpoint: string;
  private siteUrl: string = 'readiverse-haven.vercel.app';
  private siteName: string = 'Readiverse Haven';

  constructor() {
    // Get the base URL for API calls
    const baseUrl = this._getBaseUrl();
    this.apiEndpoint = `${baseUrl}/api/chat`;
    console.log('AI Service initialized with endpoint:', this.apiEndpoint);
  }

  // Get base URL for API calls
  private _getBaseUrl(): string {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for SSR or non-browser environments
    return '';
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
    try {
      // If we have audio data, transcribe it first
      let finalUserMessage = userMessage;
      let transcribedText: string | undefined = undefined;
      
      if (audioData) {
        try {
          // Transcribe the audio using our serverless function
          console.log('Transcribing audio before sending message');
          const transcription = await audioTranscriptionService.transcribeAudio(audioData);
          
          if (transcription && transcription.trim()) {
            finalUserMessage = transcription;
            transcribedText = finalUserMessage;
            console.log('Using transcribed text:', finalUserMessage);
          } else {
            console.warn('Empty transcription received, using fallback text');
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          // Continue with original message if transcription fails
        }
      }
      
      // Format messages for the API
      const formattedMessages = await this._formatMessagesForGemini(sessionId, finalUserMessage);
      
      // Add the current user message to the conversation history
      conversationManager.addMessage(sessionId, 'user', finalUserMessage);
      
      // Create request payload for our serverless function
      const requestPayload = {
        messages: formattedMessages,
        sessionId: sessionId,
        userMessage: finalUserMessage,
        generation_config: {
          temperature: 0.7,
          top_p: 0.95,
          top_k: 40,
          max_output_tokens: 1000,
        }
      };
      
      console.log('Request payload:', JSON.stringify(requestPayload));
      
      // Make API request to our serverless function
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        let errorMessage = `Chat API returned ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Chat API error:", errorData);
          errorMessage += `: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If we can't parse the error as JSON, try to get it as text
          const errorText = await response.text();
          console.error("Chat API error text:", errorText);
          errorMessage += `: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log("Chat response:", responseData);
      
      // Extract the response text
      const responseText = responseData.text || '';
      if (!responseText) {
        throw new Error('Failed to extract response from Chat API');
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
      throw error;
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
