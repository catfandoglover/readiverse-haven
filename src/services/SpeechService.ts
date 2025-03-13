
import { supabase } from '@/integrations/supabase/client';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { getSignedUrl } from '@aws-sdk/polly-request-presigner';

class SpeechService {
  private client: PollyClient | null = null;
  private voiceId: string = 'Matthew';
  private engine: string = 'neural';
  private audioCache: Map<string, string> = new Map();
  
  constructor() {
    this.initializeClient();
  }
  
  private async initializeClient() {
    try {
      const { data, error } = await supabase.functions.invoke('get-aws-credentials');
      
      if (error) {
        console.error('Error getting AWS credentials:', error);
        return;
      }
      
      if (data && data.accessKeyId && data.secretAccessKey) {
        this.client = new PollyClient({
          region: 'us-west-2',
          credentials: {
            accessKeyId: data.accessKeyId,
            secretAccessKey: data.secretAccessKey,
            sessionToken: data.sessionToken,
          }
        });
      }
    } catch (error) {
      console.error('Error initializing Polly client:', error);
    }
  }
  
  async synthesizeSpeech(text: string): Promise<string> {
    if (this.audioCache.has(text)) {
      return this.audioCache.get(text) as string;
    }
    
    if (!this.client) {
      await this.initializeClient();
      
      if (!this.client) {
        console.error('Failed to initialize Polly client');
        return '';
      }
    }
    
    try {
      const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: this.voiceId,
        Engine: this.engine,
      });
      
      const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      
      this.audioCache.set(text, signedUrl);
      return signedUrl;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return '';
    }
  }
  
  setVoice(voiceId: string) {
    this.voiceId = voiceId;
  }
  
  setEngine(engine: string) {
    this.engine = engine;
  }
}

export default new SpeechService();
