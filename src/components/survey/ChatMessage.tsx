
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { playAudio, stopAllAudio } from '@/services/AudioContext';
import useAudioStore from '@/services/AudioContext';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  dialogOpen: boolean;
  isNewMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  role, 
  audioUrl, 
  dialogOpen,
  isNewMessage = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const isVoiceMessage = role === 'user' && audioUrl && (content === 'Voice message' || content.length > 0);
  
  // Get the currently playing audio from the global store
  const currentlyPlaying = useAudioStore(state => state.currentlyPlaying);

  const cleanedContent = content;

  // Create audio element when audioUrl is available
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const newAudio = new Audio(audioUrl);
      
      // Set up event listeners
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };
      
      // Store the audio element
      audioRef.current = newAudio;
      
      // Try to get duration
      if (newAudio.duration) {
        setAudioDuration(newAudio.duration);
      }
    }
    
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Update isPlaying state based on the global audio context
  useEffect(() => {
    if (audioRef.current && currentlyPlaying !== audioRef.current) {
      // If this component's audio is not the currently playing one, update the state
      setIsPlaying(false);
    }
  }, [currentlyPlaying]);

  // Handle auto-play only for new assistant messages when dialog is open
  useEffect(() => {
    if (
      role === 'assistant' && 
      audioUrl && 
      audioRef.current && 
      dialogOpen && 
      isNewMessage && 
      !hasAutoPlayedRef.current
    ) {
      // Play the audio automatically only once using the global audio context
      playAudio(audioRef.current).catch(error => {
        console.error('Error auto-playing audio:', error);
      });
      
      setIsPlaying(true);
      hasAutoPlayedRef.current = true;
    }
  }, [audioUrl, role, dialogOpen, isNewMessage]);

  // Pause audio when dialog closes
  useEffect(() => {
    if (!dialogOpen && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [dialogOpen, isPlaying]);

  // Handle manual play/pause audio
  const toggleAudio = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Use the global audio context to play audio
      playAudio(audioRef.current).catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if this is a transcribed voice message
  const isTranscribedVoice = isVoiceMessage && content !== 'Voice message';

  return (
    <div 
      className={cn(
        "flex items-start gap-2 p-3 rounded-xl max-w-[85%]",
        role === 'user' 
          ? "bg-[#373763] text-white ml-auto" 
          : "bg-[#E9E7E2] border border-[#373763]/20 text-[#373763] mr-auto",
        isVoiceMessage && "bg-[#373763]/90"
      )}
      aria-label={`${role === 'user' ? 'Your' : 'Assistant'} message: ${cleanedContent}`}
    >
      {isVoiceMessage && (
        <Mic className="h-4 w-4 mt-1 text-white" aria-hidden="true" />
      )}
      
      <div className="flex-1">
        {isTranscribedVoice ? (
          <>
            <p className="text-xs text-white/70 mb-1">Transcribed voice message:</p>
            <p className="text-sm whitespace-pre-wrap">{cleanedContent}</p>
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{cleanedContent}</p>
        )}
      </div>
      
      {audioUrl && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-shrink-0 h-8 w-8 p-0 rounded-full",
            role === 'assistant' ? "text-[#373763] hover:bg-[#373763]/10" : "text-white hover:bg-white/10"
          )}
          onClick={toggleAudio}
          title={isPlaying ? "Pause" : "Play"}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ChatMessage;
