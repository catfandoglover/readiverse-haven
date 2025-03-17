// Check if the Web Speech API is available in the browser
const isSpeechSynthesisSupported = 'speechSynthesis' in window;

// Fallback function if SpeechSynthesis is not available
const speakFallback = (text: string) => {
  console.warn('Text-to-speech not supported in this browser.');
  console.log('Text:', text);
  // You can add more sophisticated fallback behavior here,
  // such as displaying the text in a modal or using an alternative library.
};

// Main SpeechService class
class SpeechService {
  private speechSynthesis: SpeechSynthesis | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isPaused: boolean = false;

  constructor() {
    if (isSpeechSynthesisSupported) {
      this.speechSynthesis = window.speechSynthesis;
      this.speechUtterance = new SpeechSynthesisUtterance();
      this.speechUtterance.addEventListener('end', () => {
        this.isPaused = false;
      });
      this.speechUtterance.addEventListener('boundary', (event: SpeechSynthesisEvent) => {
        // You can use this event to highlight the word being spoken
        // console.log('Word boundary:', event.charIndex, event.charLength);
      });

      // Load voices asynchronously to avoid blocking the main thread
      setTimeout(() => {
        this.loadVoice();
      }, 0);
    }
  }

  private loadVoice = () => {
    if (!this.speechSynthesis) return;

    const voices = this.speechSynthesis.getVoices();
    this.voice = voices.find(voice => voice.name === 'Google UK English Female') || voices[0] || null;
    this.speechUtterance!.voice = this.voice;
  };

  speak = (text: string) => {
    if (!isSpeechSynthesisSupported || !this.speechSynthesis || !this.speechUtterance) {
      return speakFallback(text);
    }

    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }

    // Line 82 needs to be fixed - changing String to string
    const textToSpeak: string = text;
    this.speechUtterance.text = textToSpeak;
    this.speechSynthesis.speak(this.speechUtterance);
  };

  pause = () => {
    if (!isSpeechSynthesisSupported || !this.speechSynthesis) return;

    if (this.speechSynthesis.speaking && !this.isPaused) {
      this.speechSynthesis.pause();
      this.isPaused = true;
    }
  };

  resume = () => {
    if (!isSpeechSynthesisSupported || !this.speechSynthesis) return;

    if (this.isPaused) {
      this.speechSynthesis.resume();
      this.isPaused = false;
    }
  };

  cancel = () => {
    if (!isSpeechSynthesisSupported || !this.speechSynthesis) return;

    this.speechSynthesis.cancel();
    this.isPaused = false;
  };

  // Optionally, add a method to change the voice
  setVoice = (voiceName: string) => {
    if (!isSpeechSynthesisSupported || !this.speechSynthesis || !this.speechUtterance) return;

    const voices = this.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceName);

    if (selectedVoice) {
      this.voice = selectedVoice;
      this.speechUtterance.voice = selectedVoice;
    } else {
      console.warn(`Voice "${voiceName}" not found.`);
    }
  };
}

export default SpeechService;
