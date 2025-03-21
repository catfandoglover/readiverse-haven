import AWS from 'aws-sdk';

class SpeechService {
  private polly: AWS.Polly;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.polly = new AWS.Polly({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // Initialize AudioContext
    if (typeof AudioContext !== "undefined") {
      this.audioContext = new AudioContext();
    } else if (typeof window !== "undefined" && (window as any).webkitAudioContext) {
      this.audioContext = new (window as any).webkitAudioContext();
    } else {
      console.warn("Web Audio API is not supported in this browser.");
      this.audioContext = null;
    }
  }

  public async synthesizeSpeech(text: string): Promise<string> {
    if (!this.audioContext) {
      throw new Error("AudioContext is not available.");
    }

    const params = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: 'Matthew',
      TextType: 'text',
    };

    try {
      const data = await this.polly.synthesizeSpeech(params).promise();
      if (data.AudioStream instanceof Buffer) {
        const blob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
        return URL.createObjectURL(blob);
      } else {
        throw new Error('Audio stream is not a Buffer');
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  public async playAudio(audioUrl: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error("AudioContext is not available.");
    }

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  public stopAudio(): void {
    if (this.audioContext) {
      this.audioContext.close().then(() => {
        this.audioContext = null;
        // Reinitialize AudioContext
        this.audioContext = new AudioContext();
      });
    }
  }
}

export default new SpeechService();
