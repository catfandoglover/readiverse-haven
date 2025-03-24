
import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  Engine,
  VoiceId,
  LanguageCode
} from "@aws-sdk/client-polly";
import { getSignedUrl } from "@aws-sdk/polly-request-presigner";

class SpeechService {
  private polly: PollyClient;
  private cacheMap: Map<string, string>;
  private defaultVoiceId: VoiceId;
  private defaultLanguageCode: LanguageCode;
  private defaultEngine: Engine;

  constructor() {
    this.polly = new PollyClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ""
      }
    });
    
    this.cacheMap = new Map<string, string>();
    this.defaultVoiceId = VoiceId.Joanna;
    this.defaultLanguageCode = LanguageCode.EN_US;
    this.defaultEngine = Engine.NEURAL;
  }

  public async synthesizeSpeech(
    text: string,
    voiceId = this.defaultVoiceId,
    languageCode = this.defaultLanguageCode,
    engine = this.defaultEngine
  ): Promise<string> {
    const key = `${text}_${voiceId}_${languageCode}_${engine}`;
    
    // Check cache first
    if (this.cacheMap.has(key)) {
      return this.cacheMap.get(key) as string;
    }
    
    try {
      // Clean the text to avoid issues with special characters
      const cleanedText = this.sanitizeText(text);
      
      // Prepare the command with the cleaned text
      const command = new SynthesizeSpeechCommand({
        Text: cleanedText,
        OutputFormat: OutputFormat.MP3,
        VoiceId: voiceId,
        LanguageCode: languageCode,
        Engine: engine
      });
      
      // Get the signed URL
      const url = await getSignedUrl(this.polly, command, { expiresIn: 3600 });
      
      // Store in cache
      this.cacheMap.set(key, url);
      
      return url;
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      throw error;
    }
  }
  
  private sanitizeText(text: string): string {
    // Remove special characters that might cause issues
    return text
      .replace(/&/g, " and ")
      .replace(/</g, "")
      .replace(/>/g, "")
      .replace(/"/g, "")
      .replace(/'/g, "")
      .trim();
  }
  
  public clearCache(): void {
    this.cacheMap.clear();
  }
}

const speechService = new SpeechService();
export default speechService;
