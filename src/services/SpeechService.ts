
import { PollyClient, SynthesizeSpeechCommand, Engine } from "@aws-sdk/client-polly";
import { AwsCredentialIdentity } from "@aws-sdk/types";

class SpeechService {
  private pollyClient: PollyClient;
  private credentials: AwsCredentialIdentity;
  private voice: string = "Matthew"; // Changed from String to string primitive type

  constructor(credentials: AwsCredentialIdentity, region: string) {
    this.credentials = credentials;
    this.pollyClient = new PollyClient({
      region: region,
      credentials: this.credentials,
    });
  }

  async synthesizeSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const params = {
        OutputFormat: "mp3",
        Text: text,
        VoiceId: this.voice,
        Engine: "neural" as Engine, // Use type assertion to Engine type
        TextType: 'text'
      };

      const command = new SynthesizeSpeechCommand(params);
      const response = await this.pollyClient.send(command);

      if (response.AudioStream) {
        const buffer = await response.AudioStream.transformToByteArray();
        return buffer.buffer as ArrayBuffer;
      } else {
        throw new Error("No audio stream in the response.");
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      throw error;
    }
  }

  setVoice(voice: string): void {
    this.voice = voice;
  }
}

export default SpeechService;
