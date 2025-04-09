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
import { createClient } from '@supabase/supabase-js';

class SpeechService {
  private pollyClient: PollyClient | null = null;
  private initialized: boolean = false;
  private supabase: any = null;
  private useEdgeFunction: boolean = false;

  constructor() {
    this.initializePolly();
    this.initializeSupabase();
  }

  private initializePolly() {
    try {
      const region = import.meta.env.VITE_AWS_REGION;
      const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
      const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
      
      // Check if we have the necessary credentials
      if (!region || !accessKeyId || !secretAccessKey) {
        console.warn('Missing AWS credentials for Polly service, will try edge function');
        return;
      }
      
      // Initialize the Polly client
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

  private initializeSupabase() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Missing Supabase credentials, edge functions will not be available');
        return;
      }
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.useEdgeFunction = true;
      console.log('Supabase client initialized for edge functions');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      this.useEdgeFunction = false;
    }
  }

  public isInitialized(): boolean {
    return this.initialized || this.useEdgeFunction;
  }

  public async synthesizeSpeech(text: string): Promise<string> {
    // Try edge function first if available
    if (this.useEdgeFunction) {
      try {
        const url = await this.synthesizeSpeechViaEdge(text);
        if (url) {
          return url;
        }
      } catch (edgeError) {
        console.warn('Edge function failed, falling back to direct AWS SDK', edgeError);
        // Fall through to direct AWS SDK method
      }
    }
    
    // Fall back to direct AWS SDK method
    if (!this.initialized || !this.pollyClient) {
      console.warn('Polly service not initialized and edge function failed');
      return '';
    }

    try {
      // Use Arthur voice (British English male)
      const params = {
        OutputFormat: OutputFormat.MP3,
        SampleRate: "16000", // Fixed: Using string instead of String object
        Text: text,
        TextType: TextType.TEXT,
        VoiceId: VoiceId.Arthur,  // Using Arthur voice
        Engine: Engine.NEURAL
      };
      
      console.info('Attempting to get Polly URL with params:', params);
      
      // Get a presigned URL for the speech
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

  private async synthesizeSpeechViaEdge(text: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await this.supabase.functions.invoke('api-proxy', {
      method: 'POST',
      body: { 
        service: 'polly', 
        action: 'synthesize', 
        params: { text } 
      }
    });
    
    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.url) {
      throw new Error('No URL returned from edge function');
    }
    
    console.info('Successfully got Polly URL via edge function:', data.url);
    return data.url;
  }

  public async playAudio(url: string): Promise<void> {
    try {
      if (!url) {
        console.warn('No audio URL provided');
        return;
      }
      
      // Use the AudioContext helper from AudioContext.ts
      const audioContext = createAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data and play it
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

// Create a singleton instance
export const speechService = new SpeechService();
export default speechService;