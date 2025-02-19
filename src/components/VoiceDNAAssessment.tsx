
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OutsetaAuthContext';

interface AudioRecorderConfig {
  onAudioData: (audioData: Float32Array) => void;
}

class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private config: AudioRecorderConfig) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.config.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

const VoiceDNAAssessment = () => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const encodeAudioData = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  };

  const startAssessment = async () => {
    try {
      // Connect to our Supabase Edge Function WebSocket
      wsRef.current = new WebSocket(
        `wss://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/realtime-chat`
      );

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Start recording audio
        recorderRef.current = new AudioRecorder({
          onAudioData: (audioData) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: encodeAudioData(audioData)
              }));
            }
          }
        });
        
        recorderRef.current.start().catch(error => {
          console.error('Failed to start recording:', error);
          toast({
            title: "Error",
            description: "Failed to access microphone",
            variant: "destructive"
          });
        });
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
          // Handle incoming audio...
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'response.function_call_arguments.done') {
          // Handle DNA responses...
          const args = JSON.parse(data.arguments);
          console.log('Recording DNA response:', args);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to assessment service",
          variant: "destructive"
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        recorderRef.current?.stop();
      };

    } catch (error) {
      console.error('Error starting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to start assessment",
        variant: "destructive"
      });
    }
  };

  const stopAssessment = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopAssessment();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Intellectual DNA Assessment
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-4">
            {isConnected 
              ? "Speak naturally with the AI to complete your assessment"
              : "Start a conversation with our AI to assess your intellectual DNA"}
          </p>
          
          {!isConnected ? (
            <Button 
              onClick={startAssessment}
              className="bg-primary hover:bg-primary/90"
            >
              Start Assessment
            </Button>
          ) : (
            <Button 
              onClick={stopAssessment}
              variant="destructive"
            >
              End Assessment
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-full transition-colors ${
              isSpeaking ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
            }`}>
              {isSpeaking ? 'AI is speaking...' : 'Listening...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceDNAAssessment;
