import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

class AudioTranscriptionService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private isLoadingKey: boolean = false;
  private useEdgeFunction: boolean = false;

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
    try {
      // Check if we can use edge functions
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.useEdgeFunction = true;
        this.initialized = true;
        console.log('Audio Transcription Service will use edge functions');
      }
    } catch (edgeError) {
      console.warn('Error checking edge function availability', edgeError);
    }

    // If edge functions are available, we can stop here
    if (this.useEdgeFunction && this.initialized) {
      return;
    }
    
    // Otherwise fall back to direct API access
    // First try environment variable
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (apiKey && apiKey.trim() !== '') {
      this.initialize(apiKey);
      console.log('Audio Transcription Service initialized with API key from environment variables');
      return;
    }
    
    console.warn('VITE_GOOGLE_GEMINI_API_KEY not found or empty in environment variables, trying edge function');
    
    // Try to get the key from the edge function
    const secretKey = await this.fetchSecretFromEdgeFunction();
    if (secretKey) {
      this.initialize(secretKey);
      console.log('Audio Transcription Service initialized with API key from edge function');
      return;
    }
    
    // Fallback for development
    if (import.meta.env.DEV) {
      // Use the previously hardcoded key for development only
      const devKey = 'AIzaSyC_eHbaco22arhTPHJ2ZAYyud2tG5QWCNk';
      this.initialize(devKey);
      console.log('Running in development mode with provided Gemini API key for transcription');
    } else {
      console.error('Could not get Gemini API key from any source');
      toast.error('Transcription service initialization failed. Please check your API key configuration.');
      this.initialized = false;
    }
  }

  // Initialize the service with an API key
  initialize(apiKey: string): void {
    try {
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('Invalid API key provided');
      }
      
      this.apiKey = apiKey;
      this.initialized = true;
      console.log('Audio Transcription Service initialized with Gemini successfully');
    } catch (error) {
      console.error('Error initializing Audio Transcription Service:', error);
      this.initialized = false;
    }
  }

  // Check if the service is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Transcribe audio using Gemini 2.0 Flash
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.isInitialized()) {
      // Try to initialize one more time
      if (!this.isLoadingKey) {
        await this.initializeFromEnvironment();
        
        // If still not initialized, throw error
        if (!this.isInitialized()) {
          throw new Error('Audio Transcription Service not initialized or API key is missing');
        }
      } else {
        throw new Error('Audio Transcription Service is currently loading the API key');
      }
    }

    try {
      console.log('Transcribing audio with Gemini:', audioBlob.type, audioBlob.size);
      
      // Convert audio blob to base64
      const base64Data = await this._blobToBase64(audioBlob);
      
      // Get the MIME type from the blob
      const mimeType = audioBlob.type || 'audio/webm';
      
      let responseData;
      
      // Try using edge function first if available
      if (this.useEdgeFunction) {
        try {
          responseData = await this.transcribeAudioViaEdge(base64Data, mimeType);
        } catch (edgeError) {
          console.warn('Error using edge function for transcription, falling back to direct API call', edgeError);
          // Fall through to direct API call
        }
      }
      
      // Fall back to direct API call if edge function failed or is unavailable
      if (!responseData) {
        responseData = await this.transcribeAudioViaDirectAPI(base64Data, mimeType);
      }
      
      // Extract the transcription text
      if (responseData.candidates && 
          responseData.candidates[0] && 
          responseData.candidates[0].content && 
          responseData.candidates[0].content.parts && 
          responseData.candidates[0].content.parts[0] && 
          responseData.candidates[0].content.parts[0].text) {
        
        const transcription = responseData.candidates[0].content.parts[0].text;
        
        // Clean up the transcription (remove quotes, etc.)
        let cleanedTranscription = this._cleanTranscription(transcription);
        
        // If empty after cleaning, return a default message
        if (!cleanedTranscription.trim()) {
          cleanedTranscription = "I couldn't transcribe your message clearly";
        }
        
        console.log('Transcription result:', cleanedTranscription);
        return cleanedTranscription;
      } else {
        throw new Error('Failed to extract transcription from Gemini response');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
  
  private async transcribeAudioViaEdge(audio: string, mimeType: string): Promise<any> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      method: 'POST',
      body: { 
        service: 'gemini', 
        action: 'transcribe', 
        params: { 
          audio,
          mimeType
        } 
      }
    });
    
    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Empty response from edge function');
    }
    
    return data;
  }
  
  private async transcribeAudioViaDirectAPI(audio: string, mimeType: string): Promise<any> {
    // Create request payload for Gemini
    const requestPayload = {
      contents: [
        {
          parts: [
            {
              text: "Please transcribe this audio recording accurately. DO NOT ADD any additional text or commentary:"
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: audio
              }
            }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 1024,
      }
    };
    
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
    console.log("Gemini transcription response:", responseData);
    
    return responseData;
  }
  
  // Clean up the transcription text
  private _cleanTranscription(text: string): string {
    // Remove any "Transcription:" prefix
    let cleaned = text.replace(/^(transcription:|transcript:)/i, '').trim();
    
    // Remove surrounding quotes if present
    cleaned = cleaned.replace(/^["'](.*)["']$/s, '$1');
    
    // Remove any markdown formatting
    cleaned = cleaned.replace(/```.*?```/gs, '').trim();
    
    return cleaned;
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
export const audioTranscriptionService = new AudioTranscriptionService();
export default audioTranscriptionService;
