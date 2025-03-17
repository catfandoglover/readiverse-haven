// Import AWS SDK for browser
import { PollyClient, SynthesizeSpeechCommandInput, OutputFormat, TextType, VoiceId } from '@aws-sdk/client-polly';
import { getSynthesizeSpeechUrl } from '@aws-sdk/polly-request-presigner';
import { AudioManager } from './AudioManager';
import { createClient } from '@supabase/supabase-js';

class SpeechService {
  private polly: PollyClient;
  private voiceId: VoiceId = 'Arthur'; // British English male voice
  private outputFormat: OutputFormat = 'mp3';
  private sampleRate: string = '16000';
  private textType: TextType = 'text';
  private audioContext: AudioContext | null = null;
  private audioManager: AudioManager | null = null;
  private pollyApiKey: string | null = null;
  private supabaseClient: any;

  constructor() {
    // Add debugging to check environment variables
    // console.log('AWS Config:', {
    //   region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    //   hasAccessKey: !!import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    //   hasSecretKey: !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    // });
    
    // Initialize Polly client with AWS config from environment variables
    this.polly = new PollyClient({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }

  // Set voice options
  setVoiceOptions(voiceId: VoiceId, outputFormat: OutputFormat = 'mp3', sampleRate: string = '16000'): void {
    this.voiceId = voiceId;
    this.outputFormat = outputFormat;
    this.sampleRate = sampleRate;
  }

  // Synthesize speech from text
  async synthesizeSpeech(text: string): Promise<string> {
    try {
      // Create the parameters for synthesizeSpeech
      const speechParams: SynthesizeSpeechCommandInput = {
        OutputFormat: this.outputFormat,
        SampleRate: this.sampleRate,
        Text: text,
        TextType: this.textType,
        VoiceId: this.voiceId,
        Engine: 'neural'
      };

      console.log('Attempting to get Polly URL with params:', speechParams);
      
      // Get presigned URL for the speech
      const url = await getSynthesizeSpeechUrl({
        client: this.polly,
        params: speechParams
      });

      console.log('Successfully got Polly URL:', url);
      return url;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
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

  async initializeAudioContext() {
    this.audioContext = new AudioContext();
  }

  async fetchAudioFromPolly(text: string, voiceId: string = "Joanna"): Promise<string> {
    // Create the parameters for synthesizeSpeech
    const speechParams: SynthesizeSpeechCommandInput = {
      OutputFormat: this.outputFormat,
      SampleRate: this.sampleRate,
      Text: text,
      TextType: this.textType,
      VoiceId: voiceId,
      Engine: 'neural'
    };

    console.log('Attempting to get Polly URL with params:', speechParams);
    
    // Get presigned URL for the speech
    const url = await getSynthesizeSpeechUrl({
      client: this.polly,
      params: speechParams
    });

    console.log('Successfully got Polly URL:', url);
    return url;
  }

  async playText(text: string): Promise<void> {
    const audioUrl = await this.fetchAudioFromPolly(text);
    const audio = this.playAudio(audioUrl);
  }

  async stopPlaying(): Promise<void> {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create a singleton instance
export const speechService = new SpeechService();
export default speechService;
