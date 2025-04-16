import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

class OpenRouterService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
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
      const { data, error } = await supabase.functions.invoke('get-openrouter-key', {
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
    // First try environment variable (only for development)
    if (import.meta.env.DEV) {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      if (apiKey && apiKey.trim() !== '') {
        this.initialize(apiKey);
        console.log('OpenRouter Service initialized with API key from environment variables');
        return;
      }
    }
    
    console.log('Fetching OpenRouter API key from edge function');
    
    // Try to get the key from the edge function
    const secretKey = await this.fetchSecretFromEdgeFunction();
    if (secretKey) {
      this.initialize(secretKey);
      console.log('OpenRouter Service initialized with API key from edge function');
      return;
    }
    
    // Only log an error in production
    if (import.meta.env.PROD) {
      console.error('Could not get OpenRouter API key from edge function');
      toast.error('OpenRouter service initialization failed. Please check your API key configuration.');
    }
    this.initialized = false;
  }

  // Initialize with an API key
  initialize(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      this.initialized = false;
      return;
    }
    
    this.apiKey = apiKey;
    this.initialized = true;
  }

  // Check if the service is initialized
  isInitialized(): boolean {
    return this.initialized && this.apiKey.trim() !== '';
  }

  // Method to generate a chat completion using Claude via OpenRouter
  async generateChatCompletion(
    messages: Array<{role: string, content: string}>,
    model: string = 'anthropic/claude-3.7-sonnet',
    options: {
      temperature?: number,
      max_tokens?: number,
      response_format?: { type: string }
    } = {}
  ) {
    if (!this.isInitialized()) {
      // Try to initialize one more time
      if (!this.isLoadingKey) {
        await this.initializeFromEnvironment();
        
        // If still not initialized, throw error
        if (!this.isInitialized()) {
          throw new Error('OpenRouter Service not initialized or API key is missing');
        }
      } else {
        throw new Error('OpenRouter Service is currently loading the API key');
      }
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alexandria.org',
          'X-Title': 'Alexandria'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 4000,
          response_format: options.response_format
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const openRouterService = new OpenRouterService();
export default openRouterService; 