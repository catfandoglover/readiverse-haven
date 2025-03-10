import conversationManager from './ConversationManager';

class AIService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
  private siteUrl: string = 'readiverse-haven.vercel.app';
  private siteName: string = 'Readiverse Haven';

  constructor() {
    // Initialize with environment variable if available
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  // Initialize the AI service with an API key
  initialize(apiKey: string): void {
    try {
      this.apiKey = apiKey;
      this.initialized = true;
      console.log('AI Service initialized with OpenRouter successfully');
    } catch (error) {
      console.error('Error initializing AI service:', error);
      this.initialized = false;
    }
  }

  // Check if the service is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Generate a response from the AI using OpenRouter
  async generateResponse(
    sessionId: string,
    userMessage: string,
    audioData?: Blob
  ): Promise<{ text: string; audioUrl?: string }> {
    if (!this.initialized) {
      throw new Error('AI service not initialized');
    }

    try {
      // Get conversation history and format it for OpenRouter
      const messages = this._formatMessagesForOpenRouter(sessionId, userMessage, audioData);
      
      // Add the current user message to the conversation history
      conversationManager.addMessage(sessionId, 'user', userMessage);
      
      // Make API request to OpenRouter
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "google/gemini-2.0-flash-001",
          "messages": messages,
          "temperature": 0.7,
          "top_p": 0.95,
          "max_tokens": 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API error:", errorData);
        throw new Error(`OpenRouter API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log("OpenRouter response:", responseData);
      
      // Extract the response text
      const responseText = responseData.choices[0].message.content;
      
      // If response is too long, truncate it (no longer using _shortenText)
      const finalResponse = responseText.length > 600 
        ? this._truncateText(responseText)
        : responseText;
      
      // Add the assistant response to conversation history
      conversationManager.addMessage(sessionId, 'assistant', finalResponse);
      
      return { text: finalResponse };
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

  // Format messages for OpenRouter API
  private _formatMessagesForOpenRouter(sessionId: string, userMessage: string, audioData?: Blob): any[] {
    const messages = conversationManager.getHistory(sessionId);
    const formattedMessages = [];
    
    // Add system message first (will be handled properly by OpenRouter)
    // This includes the current question in the format the LLM expects
    const systemPrompt = conversationManager.generateDynamicSystemPrompt(sessionId);
    formattedMessages.push({
      role: "system",
      content: systemPrompt
    });
    
    // Add conversation history
    if (messages.length > 0) {
      messages.forEach(msg => {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      });
    } else {
      // If there are no existing messages, we need to start with the current question
      // This ensures the model has context about what the user is discussing
      const currentQuestion = conversationManager.getCurrentQuestion(sessionId);
      formattedMessages.push({
        role: "user",
        content: `I'd like to discuss: ${currentQuestion}`
      });
    }
    
    // Add the current user message if it's not already included in the history
    // We avoid duplicating the message if it's already in the history array
    if (userMessage && (messages.length === 0 || 
        messages[messages.length - 1].role !== 'user' || 
        messages[messages.length - 1].content !== userMessage)) {
      
      formattedMessages.push({
        role: "user",
        content: userMessage
      });
    }
    
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

  // The _shortenText method has been replaced by _truncateText
}

// Create a singleton instance
export const aiService = new AIService();
export default aiService;
