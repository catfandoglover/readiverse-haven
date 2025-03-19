import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "@/integrations/firebase";
import { v4 as uuidv4 } from 'uuid';

class SpeechService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    this.apiUrl = "https://api.openai.com/v1/audio/speech";
  }

  async textToSpeech(text: string, voice: string = 'alloy'): Promise<string | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: voice,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = `speech-${uuidv4()}.mp3`;
      const storageRef = ref(storage, `audio/${filename}`);

      await uploadBytes(storageRef, buffer, { contentType: 'audio/mpeg' });
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error: any) {
      console.error("Error converting text to speech:", error.message);
      return null;
    }
  }

  async transcribeAudio(audioFile: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error: any) {
      console.error("Error transcribing audio:", error.message);
      return null;
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", errorText);
            throw new Error(`OpenAI image generation failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].url;
        } else {
            console.warn("No image URL received from OpenAI.");
            return null;
        }
    } catch (error: any) {
        console.error("Error generating image:", error.message);
        return null;
    }
}

  async correctGrammar(text: string): Promise<string | null> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that corrects the grammar and spelling of the given text. Return only the corrected text.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        console.warn("No corrected text received from OpenAI.");
        return null;
      }
    } catch (error: any) {
      console.error("Error correcting grammar:", error.message);
      return null;
    }
  }
}

export default new SpeechService();
