import { 
  PollyClient, 
  SynthesizeSpeechCommand,
  OutputFormat,
  Engine,
  VoiceId,
  TextType
} from "@aws-sdk/client-polly";
import { getSynthesizeSpeechUrl } from "@aws-sdk/polly-request-presigner";
import useAudioStore, { createAudioContext } from './AudioContext';
import { toast } from 'sonner';

class SpeechService {
  private pollyClient: PollyClient | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initializePolly();
  }

  private initializePolly() {
    try {
      const region = import.meta.env.VITE_AWS_REGION;
      const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
      const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
      
      if (!region || !accessKeyId || !secretAccessKey) {
        console.warn('Missing AWS credentials for Polly service');
        return;
      }
      
      this.pollyClient = new PollyClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      
      this.initialized = true;
      console.log('AWS Polly service initialized successfully');
    } catch (error) {
      console.error('Error initializing AWS Polly:', error);
      this.initialized = false;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async synthesizeSpeech(text: string): Promise<string> {
    if (!this.initialized || !this.pollyClient) {
      console.warn('Polly service not initialized');
      return '';
    }

    try {
      const params = {
        OutputFormat: OutputFormat.MP3,
        SampleRate: "16000",
        Text: text,
        TextType: TextType.TEXT,
        VoiceId: VoiceId.Arthur,
        Engine: Engine.NEURAL
      };
      
      console.info('Attempting to get Polly URL with params:', params);
      
      const url = await getSynthesizeSpeechUrl({
        client: this.pollyClient,
        params
      });
      
      console.info('Successfully got Polly URL:', url);
      
      return url;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return '';
    }
  }

  public async playAudio(url: string): Promise<void> {
    try {
      if (!url) {
        console.warn('No audio URL provided');
        return;
      }
      
      const audioContext = createAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
