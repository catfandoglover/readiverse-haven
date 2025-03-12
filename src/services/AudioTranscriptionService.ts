class AudioTranscriptionService {
  private apiEndpoint: string;
  private initialized: boolean = true; // Always initialized since we're using serverless functions

  constructor() {
    // Get the base URL for API calls
    const baseUrl = this._getBaseUrl();
    this.apiEndpoint = `${baseUrl}/api/transcribe`;
    console.log('Audio Transcription Service initialized with endpoint:', this.apiEndpoint);
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

  // Transcribe audio using serverless function
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('Transcribing audio with serverless function:', audioBlob.type, audioBlob.size);
      
      // Convert audio blob to base64
      const base64Data = await this._blobToBase64(audioBlob);
      
      // Get the MIME type from the blob
      const mimeType = audioBlob.type || 'audio/webm';
      
      // Call our serverless function
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: mimeType
        })
      });
      
      if (!response.ok) {
        let errorMessage = `Transcription API returned ${response.status}`;
        // Clone the response to avoid the "body stream already read" error
        const errorClone = response.clone();
        try {
          const errorData = await errorClone.json();
          console.error("Transcription API error:", errorData);
          errorMessage += `: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If we can't parse the error as JSON, try to get it as text
          const errorText = await response.text();
          console.error("Transcription API error text:", errorText);
          errorMessage += `: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }
      
      // Clone the response before reading the JSON
      const responseData = await response.clone().json();
      console.log("Transcription response:", responseData);
      
      if (responseData.transcription) {
        console.log('Transcription result:', responseData.transcription);
        return responseData.transcription;
      } else {
        throw new Error('Failed to extract transcription from API response');
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
