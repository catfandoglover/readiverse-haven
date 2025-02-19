import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/OutsetaAuthContext';

interface VoiceDNAAssessmentProps {
  questionText: string;
  isEnabled: boolean;
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

const VoiceDNAAssessment: React.FC<VoiceDNAAssessmentProps> = ({ 
  questionText,
  isEnabled
}) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const hasAskedQuestionRef = useRef(false);
  const sessionCreatedRef = useRef(false);
  const messageQueueRef = useRef<any[]>([]);
  const currentQuestionRef = useRef<string>('');

  useEffect(() => {
    if (isEnabled && !isConnected && !isConnecting) {
      startAssessment();
    }
    if (!isEnabled && isConnected) {
      stopAssessment();
    }
  }, [isEnabled]);

  useEffect(() => {
    if (questionText !== currentQuestionRef.current && isConnected) {
      currentQuestionRef.current = questionText;
      const userMessage = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'text',
            text: `The question is: "${questionText}" What are your thoughts on this ethical dilemma?`
          }]
        }
      };
      queueOrSendMessage(userMessage);
      queueOrSendMessage({ type: 'response.create' });
    }
  }, [questionText, isConnected]);

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

  const sendQueuedMessages = () => {
    if (dataChannelRef.current?.readyState === 'open' && sessionCreatedRef.current) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        console.log('Sending queued message:', message);
        dataChannelRef.current.send(JSON.stringify(message));
      }
    }
  };

  const queueOrSendMessage = (message: any) => {
    if (dataChannelRef.current?.readyState === 'open' && sessionCreatedRef.current) {
      console.log('Sending message directly:', message);
      dataChannelRef.current.send(JSON.stringify(message));
    } else {
      console.log('Queueing message:', message);
      messageQueueRef.current.push(message);
    }
  };

  const sendSessionConfig = () => {
    console.log('Sending session config...');
    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        },
        temperature: 0.7,
        max_response_output_tokens: 200
      }
    };
    queueOrSendMessage(sessionConfig);

    const initialSystemMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [{
          type: 'text',
          text: `You are a supportive AI companion during a DNA assessment. Your role is to engage in thoughtful discussion about each ethical question presented, helping the user explore different perspectives. Read the question displayed and discuss its ethical implications with the user. Keep responses brief but insightful. Do not try to influence their decision - your role is to facilitate reflection.`
        }]
      }
    };
    queueOrSendMessage(initialSystemMessage);
    
    if (currentQuestionRef.current) {
      const userMessage = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'text',
            text: `The question is: "${currentQuestionRef.current}" What are your thoughts on this ethical dilemma?`
          }]
        }
      };
      queueOrSendMessage(userMessage);
      queueOrSendMessage({ type: 'response.create' });
    }
  };

  const startAssessment = async () => {
    try {
      setIsConnecting(true);
      console.log('Starting assessment...');

      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElement.id = 'voice-dna-audio';
      document.body.appendChild(audioElement);
      audioElementRef.current = audioElement;
      
      const { data: response, error: invokeError } = await supabase.functions.invoke('realtime-chat');
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

      const configuration = { 
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1
        } 
      });
      
      mediaStream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, mediaStream);
        }
      });

      dataChannelRef.current = peerConnectionRef.current.createDataChannel('oai-events');
      console.log('Created data channel');

      dataChannelRef.current.onopen = () => {
        console.log('Data channel opened');
        sendQueuedMessages();
      };

      dataChannelRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received event:', data);

        if (data.type === 'session.created') {
          console.log('Session created');
          sessionCreatedRef.current = true;
          sendSessionConfig();
        }
        
        if (data.type === 'response.audio.delta') {
          console.log('AI is speaking...');
          setIsSpeaking(true);
        } else if (data.type === 'response.audio.done') {
          console.log('AI finished speaking');
          setIsSpeaking(false);
          if (!hasAskedQuestionRef.current) {
            hasAskedQuestionRef.current = true;
            setIsWaitingForResponse(false);
          }
        } else if (data.type === 'response.audio_transcript.delta') {
          console.log('Transcript delta:', data.delta);
          const response = data.delta.trim();
          if (!isWaitingForResponse && (response === 'A' || response === 'B')) {
            console.log('Valid response received:', response);
            setIsWaitingForResponse(true);
            queueOrSendMessage({ type: 'response.create' });
          }
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (audioElementRef.current && event.streams[0]) {
          audioElementRef.current.srcObject = event.streams[0];
          audioElementRef.current.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        }
      };

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnectionRef.current.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
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
        throw new Error(`Failed to connect to OpenAI: ${errorText}`);
      }

      const sdpAnswer = await sdpResponse.text();
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: sdpAnswer
      };

      await peerConnectionRef.current.setRemoteDescription(answer);

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
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current.remove();
      audioElementRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className={`inline-block px-4 py-2 rounded-full transition-colors ${
        isSpeaking ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
      }`}>
        {isSpeaking ? 'Virgil is speaking...' : 'Virgil is listening...'}
      </div>
      <audio 
        ref={audioElementRef}
        autoPlay
        playsInline
        className="hidden"
      />
    </div>
  );
};

export default VoiceDNAAssessment;
