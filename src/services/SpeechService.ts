import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Constants
const NEURAL_ENGINE = 'neural';
const STANDARD_ENGINE = 'standard';
const MP3_FORMAT = 'mp3';
const PCM_FORMAT = 'pcm';
const TEXT_TYPE = 'text';
const SSML_TYPE = 'ssml';

export class SpeechService {
  private readonly pollyClient: PollyClient;
  private readonly region: string;
  private readonly voice: string;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private audioCache: Map<string, ArrayBuffer> = new Map();

  constructor(region: string = 'us-east-1', voice: string = 'Joanna') {
    this.region = region;
    this.voice = voice;
    this.pollyClient = new PollyClient({
      region: this.region,
      credentials: {
        accessKeyId: 'AKIA3F6HGPVIFNPEZIA7',
        secretAccessKey: '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'
      }
    });
  }

  public synthesizeSpeech = async (text: string, format: string = 'mp3'): Promise<ArrayBuffer> => {
    const cacheKey = `${text}-${format}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const params = {
        OutputFormat: format,
        Text: text,
        VoiceId: this.voice,
        Engine: 'neural'
      };

      const command = new SynthesizeSpeechCommand(params);
      const response = await this.pollyClient.send(command);

      if (response.AudioStream) {
        const audioArrayBuffer = await new Response(response.AudioStream).arrayBuffer();
        this.audioCache.set(cacheKey, audioArrayBuffer);
        return audioArrayBuffer;
      } else {
        throw new Error('No audio stream received from Polly.');
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  };

  public playAudio = async (text: string, format: string = 'mp3'): Promise<void> => {
    try {
      if (this.isPlaying) {
        this.stopAudio();
      }

      const audioBuffer = await this.synthesizeSpeech(text, format);

      this.audioContext = this.audioContext || new AudioContext();
      const audioBufferDecoded = await this.audioContext.decodeAudioData(audioBuffer);

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBufferDecoded;
      this.currentSource.connect(this.audioContext.destination);
      this.currentSource.onended = () => {
        this.stopAudio();
      };

      this.currentSource.start(0);
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  public stopAudio = (): void => {
    if (this.isPlaying && this.currentSource && this.audioContext) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
      this.isPlaying = false;
    }
  };

  public getAudioPlayer = async (text: string, format: string = 'mp3'): Promise<HTMLAudioElement> => {
    try {
      const audioBuffer = await this.synthesizeSpeech(text, format);
      const blob = new Blob([audioBuffer], { type: `audio/${format}` });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      return audio;
    } catch (error) {
      console.error('Error creating audio player:', error);
      throw error;
    }
  };

  private async createPresignedUrl(text: string, format: string): Promise<string> {
    const params = {
      OutputFormat: format,
      Text: text,
      VoiceId: this.voice,
      Engine: 'neural'
    };

    const command = new SynthesizeSpeechCommand(params);
    const url = await getSignedUrl(this.pollyClient, command, { expiresIn: 3600 });
    return url;
  }

  public async getAudioUrl(text: string, format: string = 'mp3'): Promise<string> {
    try {
      return await this.createPresignedUrl(text, format);
    } catch (error) {
      console.error('Error getting audio URL:', error);
      throw error;
    }
  }
}
