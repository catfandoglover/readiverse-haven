class SpeechService {
  private voiceId: string = 'Arthur'; // British English male voice
  private outputFormat: string = 'mp3';
  private sampleRate: string = '16000';
  private textType: string = 'text';
  private apiEndpoint: string;

  constructor() {
    // Get the base URL for API calls
    const baseUrl = this._getBaseUrl();
    this.apiEndpoint = `${baseUrl}/api/text-to-speech`;
    console.log('Speech Service initialized with endpoint:', this.apiEndpoint);
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

  // Set voice options
  setVoiceOptions(voiceId: string, outputFormat: string = 'mp3', sampleRate: string = '16000'): void {
    this.voiceId = voiceId;
    this.outputFormat = outputFormat;
    this.sampleRate = sampleRate;
  }

  // Synthesize speech from text
  async synthesizeSpeech(text: string): Promise<string> {
    try {
      // Call our serverless function
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          voiceId: this.voiceId,
          outputFormat: this.outputFormat,
          sampleRate: this.sampleRate,
          textType: this.textType
        })
      });

      if (!response.ok) {
        let errorMessage = `Text-to-speech API returned ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Text-to-speech API error:", errorData);
          errorMessage += `: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If we can't parse the error as JSON, try to get it as text
          const errorText = await response.text();
          console.error("Text-to-speech API error text:", errorText);
          errorMessage += `: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      if (responseData.audioUrl) {
        return responseData.audioUrl;
      } else {
        throw new Error('Failed to get audio URL from API response');
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  // Create a temporary audio element and play the audio
  playAudio(audioUrl: string): HTMLAudioElement {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
    return audio;
  }
}

// Create a singleton instance
export const speechService = new SpeechService();
export default speechService;
