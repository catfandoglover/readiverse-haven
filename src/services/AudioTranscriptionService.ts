class AudioTranscriptionService {
  private initialized: boolean = true; // Always initialized since we're using a serverless function

  constructor() {
    console.log('Audio Transcription Service initialized with serverless endpoint');
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
      
      // Call our serverless function instead of Gemini directly
      const response = await fetch('/api/transcribe', {
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
        const errorData = await response.json();
        console.error("Transcription API error:", errorData);
        throw new Error(`Transcription API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
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
