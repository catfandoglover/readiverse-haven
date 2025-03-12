class SpeechService {
  private voiceId: string = 'Arthur'; // British English male voice
  private outputFormat: string = 'mp3';
  private sampleRate: string = '16000';
  private textType: string = 'text';

  constructor() {
    console.log('Speech Service initialized with serverless endpoint');
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
      // Call our serverless function instead of AWS Polly directly
      const response = await fetch('/api/text-to-speech', {
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
        const errorData = await response.json();
        console.error("Text-to-speech API error:", errorData);
        throw new Error(`Text-to-speech API returned ${response.status}: ${JSON.stringify(errorData)}`);
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
