
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { Compass, LibraryBig, Dna, Search } from "lucide-react";

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
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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

      // Create audio element and initialize it
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElement.id = 'voice-dna-audio';
      document.body.appendChild(audioElement);
      audioElementRef.current = audioElement;
      console.log('Created and added audio element to DOM');

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

      // Initialize WebRTC peer connection with audio output
      const configuration = { 
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      console.log('Peer connection created');

      // Get and add local audio stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, mediaStream);
        }
      });
      console.log('Added audio track to peer connection');

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

      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event);
        if (audioElementRef.current && event.streams[0]) {
          console.log('Setting audio source:', event.streams[0]);
          audioElementRef.current.srcObject = event.streams[0];
          
          // Ensure audio is playing
          const playPromise = audioElementRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing audio:', error);
            });
          }
        }
      };

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Created and set local description');

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
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current.remove();
      audioElementRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  const handleNavigation = (path: string) => {
    if (path === '/dna' && location.pathname !== '/dna') {
      navigate('/dna');
    } else if (path === '/') {
      navigate('/');
    } else if (path === '/bookshelf') {
      navigate('/bookshelf');
    } else {
      navigate(path);
    }
  };

  const isCurrentSection = (path: string) => {
    if (path === '/dna') {
      return location.pathname.startsWith('/dna');
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/bookshelf') {
      return location.pathname.startsWith('/bookshelf');
    }
    return false;
  };

  const buttonGradientStyles = "text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]";

  useEffect(() => {
    return () => {
      stopAssessment();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-50 bg-background">
          <div className="flex justify-between items-center">
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </button>
            <button
              onClick={() => handleNavigation('/search')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-oxanium text-center text-foreground uppercase mb-8">
            Voice DNA Assessment
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-foreground/80 mb-8 leading-relaxed">
                Have a natural conversation with our AI to assess your intellectual DNA. 
                Speak freely about your philosophical views and let our system analyze your perspectives.
              </p>
              
              {!isConnected ? (
                <Button 
                  onClick={startAssessment}
                  className={buttonGradientStyles}
                  disabled={isConnecting}
                >
                  <span>{isConnecting ? 'Connecting...' : 'Start Voice Assessment'}</span>
                </Button>
              ) : (
                <Button 
                  onClick={stopAssessment}
                  variant="destructive"
                  className={buttonGradientStyles}
                >
                  <span>End Assessment</span>
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

            <audio 
              ref={audioElementRef}
              autoPlay
              playsInline
              className="hidden"
            />
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <Dna className="h-6 w-6" />
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs font-oxanium">Bookshelf</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default VoiceDNAAssessment;
