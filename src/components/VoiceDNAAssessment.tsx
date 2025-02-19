
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
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);

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
      console.log('Starting assessment...');

      // Get ephemeral token from our Edge Function
      const { data: response, error: invokeError } = await supabase.functions.invoke('realtime-chat');
      console.log('Edge function response:', response);
      
      if (invokeError) {
        console.error('Edge function error:', invokeError);
        throw new Error(`Edge function error: ${invokeError.message}`);
      }

      if (!response?.token) {
        console.error('Invalid response:', response);
        throw new Error('Failed to get token from edge function');
      }

      const token = response.token;
      console.log('Got token, creating peer connection...');

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection();
      console.log('Peer connection created');

      // Set up audio track
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnectionRef.current.addTrack(mediaStream.getTracks()[0], mediaStream);
      console.log('Added audio track to peer connection');

      // Set up data channel
      dataChannelRef.current = peerConnectionRef.current.createDataChannel('oai-events');
      console.log('Created data channel');

      dataChannelRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received event:', data);

        if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'response.function_call_arguments.done') {
          const args = JSON.parse(data.arguments);
          console.log('Recording DNA response:', args);
        }
      };

      // Handle remote audio
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event);
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      // Create and set local description
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Created and set local description');

      // Connect to OpenAI
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      console.log('Connecting to OpenAI with SDP:', offer.sdp);
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('OpenAI SDP error:', errorText);
        throw new Error('Failed to connect to OpenAI');
      }

      const sdpAnswer = await sdpResponse.text();
      console.log('Received SDP answer');

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: sdpAnswer
      };

      await peerConnectionRef.current.setRemoteDescription(answer);
      console.log('Set remote description, WebRTC connection established');

      // Start recording
      recorderRef.current = new AudioRecorder({
        onAudioData: (audioData) => {
          if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioData(audioData)
            }));
          }
        }
      });

      await recorderRef.current.start();
      console.log('Started audio recording');
      
      setIsConnected(true);
      setIsConnecting(false);

    } catch (error) {
      console.error('Error starting assessment:', error);
      setIsConnecting(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start assessment",
        variant: "destructive"
      });
      stopAssessment();
    }
  };

  const stopAssessment = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    // Create audio element for remote audio
    const audioElement = new Audio();
    audioElement.autoplay = true;
    audioElementRef.current = audioElement;

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
              {isSpeaking ? 'AI is speaking...' : 'Listening...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceDNAAssessment;
