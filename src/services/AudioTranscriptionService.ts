class AudioTranscriptionService {
  private apiKey: string = '';
  private initialized: boolean = false;
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    // Initialize with environment variable if available
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  // Initialize the service with an API key
  initialize(apiKey: string): void {
    try {
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
    if (!this.initialized) {
      throw new Error('Audio Transcription Service not initialized');
    }

    try {
      console.log('Transcribing audio with Gemini:', audioBlob.type, audioBlob.size);
      
      // Convert audio blob to base64
      const base64Data = await this._blobToBase64(audioBlob);
      
      // Get the MIME type from the blob
      const mimeType = audioBlob.type || 'audio/webm';
      
      // Create request payload for Gemini
      const requestPayload = {
        contents: [
          {
            parts: [
              {
                text: "Please transcribe this audio recording accurately:"
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
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
