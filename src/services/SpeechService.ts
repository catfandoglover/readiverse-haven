
import AWS from 'aws-sdk';
import { createPresignedUrl } from "@aws-sdk/polly-request-presigner";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

class SpeechService {
  private pollyClient: PollyClient;
  private cacheSynthesisResults: Map<string, string>;

  constructor() {
    const region = 'us-east-1';
    
    this.pollyClient = new PollyClient({
      region,
      credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || ''
      }
    });
    
    this.cacheSynthesisResults = new Map();
  }

  hashText(text: string): string {
    // Simple hash function for text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async synthesizeSpeech(text: string): Promise<string> {
    try {
      // For empty text, don't try to synthesize
      if (!text.trim()) {
        return '';
      }
      
      // Check cache first
      const textHash = this.hashText(text);
      const cachedUrl = this.cacheSynthesisResults.get(textHash);
      if (cachedUrl) {
        console.log('Using cached synthesis result');
        return cachedUrl;
      }

      console.log('Synthesizing speech for text:', text);
      
      // Use AWS Polly to generate speech
      const params = {
        OutputFormat: "mp3",
        Text: text,
        TextType: "text",
        VoiceId: "Matthew",
        Engine: "neural",
        LanguageCode: "en-US"
      };

      // Create the presigned URL for the synthesis task
      const command = new SynthesizeSpeechCommand(params);
      const url = await createPresignedUrl(this.pollyClient, command, { expiresIn: 3600 });
      
      // Cache the result
      this.cacheSynthesisResults.set(textHash, url);
      
      return url;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return '';
    }
  }
}

const speechService = new SpeechService();

export default speechService;
