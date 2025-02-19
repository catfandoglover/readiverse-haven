
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [openAIReady, setOpenAIReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

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
      setIsConnecting(true);
      console.log('Connecting to WebSocket...');

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected, closing existing connection...');
        wsRef.current.close();
      }

      // Connect to our Supabase Edge Function WebSocket
      const wsUrl = `wss://myeyoafugkrkwcnfedlu.functions.supabase.co/functions/v1/realtime-chat`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'status' && data.message === 'Connected to OpenAI') {
          setOpenAIReady(true);
          // Start recording audio only after OpenAI is ready
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
        } else if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'response.function_call_arguments.done') {
          const args = JSON.parse(data.arguments);
          console.log('Recording DNA response:', args);
        } else if (data.type === 'error') {
          console.error('Received error from server:', data.message);
          toast({
            title: "Connection Error",
            description: data.message,
            variant: "destructive"
          });
          if (data.message === 'OpenAI connection not ready') {
            // Don't stop assessment for this specific error, wait for ready state
            return;
          }
          stopAssessment();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setOpenAIReady(false);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
          reconnectAttempts.current++;
          setTimeout(startAssessment, 1000 * reconnectAttempts.current);
        } else {
          toast({
            title: "Connection Error",
            description: "Failed to connect after multiple attempts. Please try again later.",
            variant: "destructive"
          });
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        setOpenAIReady(false);
        if (recorderRef.current) {
          recorderRef.current.stop();
          recorderRef.current = null;
        }
      };

    } catch (error) {
      console.error('Error starting assessment:', error);
      setIsConnecting(false);
      setOpenAIReady(false);
      toast({
        title: "Error",
        description: "Failed to start assessment",
        variant: "destructive"
      });
    }
  };

  const stopAssessment = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setOpenAIReady(false);
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
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Start Assessment'}
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
              {isSpeaking ? 'AI is speaking...' : openAIReady ? 'Listening...' : 'Connecting to AI...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceDNAAssessment;
