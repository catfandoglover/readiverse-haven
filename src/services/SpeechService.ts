
// Fix the type error in this file
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

class SpeechService {
  private static instance: SpeechService;
  private apiKey: string | null = null;
  private region: string | null = null;
  private recognizer: SpeechRecognizer | null = null;
  private isListening: boolean = false;
  private onRecognizedCallback: ((text: string) => void) | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public configure(apiKey: string, region: string): void {
    this.apiKey = apiKey;
    this.region = region;
  }

  public startListening(onRecognized: (text: string) => void): Promise<void> {
    if (this.isListening) {
      console.log("Already listening");
      return Promise.resolve();
    }

    if (!this.apiKey || !this.region) {
      console.error("Speech service not configured");
      return Promise.reject("Speech service not configured");
    }

    try {
      this.onRecognizedCallback = onRecognized;
      
      const speechConfig = SpeechConfig.fromSubscription(this.apiKey, this.region);
      // Use standard language rather than String constructor to fix the type error
      speechConfig.speechRecognitionLanguage = "en-US";
      
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);

      this.recognizer.recognized = (s, e) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
          const recognizedText = e.result.text;
          console.log(`RECOGNIZED: ${recognizedText}`);
          
          if (this.onRecognizedCallback && recognizedText) {
            this.onRecognizedCallback(recognizedText);
          }
        }
      };

      this.isListening = true;
      return Promise.resolve(this.recognizer.startContinuousRecognitionAsync());
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      return Promise.reject(error);
    }
  }

  public stopListening(): Promise<void> {
    if (!this.isListening || !this.recognizer) {
      return Promise.resolve();
    }

    try {
      this.isListening = false;
      this.onRecognizedCallback = null;
      return Promise.resolve(this.recognizer.stopContinuousRecognitionAsync());
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      return Promise.reject(error);
    }
  }
}

export default SpeechService;
