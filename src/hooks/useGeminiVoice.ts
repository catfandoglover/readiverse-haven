import { useState, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseGeminiVoiceProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  currentQuestion: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const useGeminiVoice = ({
  onTranscript,
  onResponse,
  onError,
  currentQuestion
}: UseGeminiVoiceProps) => {
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize socket connection
  useEffect(() => {
    try {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: '/socket.io/',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        onError?.(new Error(`Socket connection failed: ${error.message}`));
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('message', (message) => {
        if (message.serverContent?.model_turn?.text) {
          onResponse?.(message.serverContent.model_turn.text);
        }
      });

      socketRef.current.on('geminiAudio', (audioBase64) => {
        playAudioResponse(audioBase64);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        onError?.(new Error(error));
      });

      return () => {
        socketRef.current?.disconnect();
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      onError?.(error as Error);
    }
  }, [onResponse, onError]);

  // Function to play audio response
  const playAudioResponse = async (audioBase64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({
          sampleRate: 24000 // Match Gemini's output sample rate
        });
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(audioBase64);
      const bytes = new Int16Array(binaryString.length / 2); // Use Int16Array for 16-bit PCM
      
      // Convert binary string to 16-bit PCM samples
      for (let i = 0; i < binaryString.length; i += 2) {
        bytes[i / 2] = (binaryString.charCodeAt(i) << 8) | binaryString.charCodeAt(i + 1);
      }
      
      // Create audio buffer with correct format
      const audioBuffer = audioContextRef.current.createBuffer(
        1, // mono channel
        bytes.length,
        24000 // sample rate must match Gemini's output
      );
      
      // Copy samples to audio buffer
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < bytes.length; i++) {
        channelData[i] = bytes[i] / 32768.0; // Convert Int16 to Float32
      }

      // Play the audio
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      onError?.(error as Error);
    }
  };

  const startVoiceChat = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (socketRef.current?.connected && e.data.size > 0) {
          const arrayBuffer = await e.data.arrayBuffer();
          const base64Data = arrayBufferToBase64(arrayBuffer);
          
          socketRef.current.emit('audioData', {
            audioBase64: base64Data
          });
        }
      };

      recorder.start(100); // Send chunks every 100ms
      setIsListening(true);

    } catch (error) {
      console.error('Error starting voice chat:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  const stopVoiceChat = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('textInput', { text });
    }
  }, []);

  return {
    isListening,
    startVoiceChat,
    stopVoiceChat,
    sendTextMessage
  };
}; 
