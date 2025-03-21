import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { getSignedUrl } from "@aws-sdk/s3-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

class PresignerPolly {
  private s3Client: S3Client;
  private region: string;
  private credentials: Credentials;

  constructor(config: { region: string; credentials: Credentials }) {
    this.region = config.region;
    this.credentials = config.credentials;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: this.credentials,
    });
  }

  public async getPresignedUrl(bucket: string, key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      console.error("Error generating presigned URL", error);
      throw error;
    }
  }
}

export class SpeechService {
  private static instance: SpeechService;
  private audioContext: AudioContext | null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private audioSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private volume = 1.0;
  private rate = 1.0;
  private pitch = 0;
  private voice: string = "Matthew"; // Default voice
  private pollyClient: PollyClient | null = null;
  private presigner: PresignerPolly | null = null;

  private constructor() {
    this.audioContext = null;
    this.initializeAudioContext();
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private initializeAudioContext() {
    try {
      // Create AudioContext only when user interacts with the page
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        
        // Create gain node for volume control
        if (this.audioContext) {
          this.gainNode = this.audioContext.createGain();
          this.gainNode.gain.value = this.volume;
          this.gainNode.connect(this.audioContext.destination);
        }
      }
    } catch (error) {
      console.error("Web Audio API is not supported in this browser", error);
    }
  }

  public setPollyClient(region: string, credentials: any) {
    try {
      this.pollyClient = new PollyClient({
        region,
        credentials
      });
      this.presigner = new PresignerPolly({
        region,
        credentials
      });
    } catch (error) {
      console.error("Failed to initialize Polly client", error);
    }
  }

  public async speakText(text: string): Promise<void> {
    if (!text) return Promise.resolve();
    
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    
    try {
      const audioBuffer = await this.synthesizeSpeech(text);
      if (audioBuffer) {
        this.audioQueue.push(audioBuffer);
        if (!this.isPlaying) {
          this.playNextInQueue();
        }
      }
    } catch (error) {
      console.error("Error speaking text:", error);
    }
  }

  public setVoice(voice: string): void {
    this.voice = voice;  // Using string type instead of String object
  }

  private async synthesizeSpeech(text: string): Promise<AudioBuffer | null> {
    if (!this.pollyClient) {
      console.warn("Polly client is not initialized.");
      return null;
    }

    try {
      const params = {
        OutputFormat: "pcm",
        SampleRate: "16000",
        Text: text,
        TextType: "text",
        VoiceId: this.voice,
      };

      const command = new SynthesizeSpeechCommand(params);
      const data = await this.pollyClient.send(command);

      if (data.AudioStream) {
        const buffer = await data.AudioStream.transformToByteArray();
        return await this.decodeAudioData(buffer);
      } else {
        console.warn("No audio stream received from Polly.");
        return null;
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      return null;
    }
  }

  private async decodeAudioData(arrayBuffer: Uint8Array): Promise<AudioBuffer | null> {
    if (!this.audioContext) {
      this.initializeAudioContext();
      if (!this.audioContext) {
        console.error("Audio context is not available.");
        return null;
      }
    }

    try {
      return await this.audioContext.decodeAudioData(arrayBuffer.buffer);
    } catch (error) {
      console.error("Error decoding audio data:", error);
      return null;
    }
  }

  private async playNextInQueue(): Promise<void> {
    if (this.isPlaying) return;
    if (this.audioQueue.length === 0) return;

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift();

    if (audioBuffer && this.audioContext) {
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.onended = () => {
        this.stopPlayback();
        if (this.audioQueue.length > 0) {
          this.playNextInQueue();
        } else {
          this.isPlaying = false;
        }
      };

      // Connect the audio source to the gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume; // Set the gain value

      this.audioSource.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.audioSource.start(0);
    }
  }

  public stopPlayback(): void {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    this.isPlaying = false;
  }

  public setVolume(volume: number): void {
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public setRate(rate: number): void {
    this.rate = rate;
    if (this.audioSource) {
      this.audioSource.playbackRate.value = this.rate;
    }
  }

  public setPitch(pitch: number): void {
    this.pitch = pitch;
    // Implement pitch shifting if needed (complex and may require additional libraries)
    console.warn("Pitch control is not yet implemented.");
  }

  public clearQueue(): void {
      this.stopPlayback();
      this.audioQueue = [];
      this.isPlaying = false;
  }
}
