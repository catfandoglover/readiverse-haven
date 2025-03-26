class SpeechService {
  private apiKey: string;
  private region: string;

  constructor() {
    this.apiKey = process.env.AZURE_SPEECH_API_KEY || '';
    this.region = process.env.AZURE_SPEECH_REGION || '';

    if (!this.apiKey || !this.region) {
      console.warn("Azure Speech API key or region not found in environment variables.");
    }
  }

  public async synthesizeSpeech(text: string): Promise<string> {
    if (!this.apiKey || !this.region) {
      console.warn("Azure Speech API key or region not configured. Speech synthesis will not work.");
      return Promise.reject("Azure Speech API key or region not configured.");
    }

    const url = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const headers = {
      'Ocp-Apim-Subscription-Key': this.apiKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitratepcm',
      'User-Agent': 'lov-ai'
    };

    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>${text}</voice></speak>`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: ssml
      });

      if (!response.ok) {
        console.error(`Speech synthesis failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        return Promise.reject(`Speech synthesis failed: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      return audioUrl;

    } catch (error) {
      console.error("Error during speech synthesis:", error);
      return Promise.reject(error);
    }
  }
}

const speechService = new SpeechService();
export default speechService;
