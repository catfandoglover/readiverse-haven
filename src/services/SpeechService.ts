import { supabase } from '@/integrations/supabase/client';

class SpeechService {
  private static instance: SpeechService;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private interimResults: string[] = [];
  private finalResult: string = '';
  private maxDuration: number = 30000; // 30 seconds
  private timeoutId: NodeJS.Timeout | null = null;

  private constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.finalResult = transcript;
          if (this.onResultCallback) {
            this.onResultCallback(transcript);
          }
        } else {
          interimTranscript += transcript;
          this.interimResults = [interimTranscript];
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    };

    this.recognition.onerror = (event) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
      this.isListening = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    };
  }

  public startListening(
    onResult: (text: string) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    this.interimResults = [];
    this.finalResult = '';

    try {
      this.recognition.start();
      this.isListening = true;

      // Set timeout to automatically stop after maxDuration
      this.timeoutId = setTimeout(() => {
        this.stopListening();
      }, this.maxDuration);
    } catch (error) {
      onError('Error starting speech recognition');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public getInterimResults(): string[] {
    return this.interimResults;
  }

  public getFinalResult(): string {
    return this.finalResult;
  }
}

export default SpeechService;
