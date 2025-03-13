
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
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
  
  const currentlyPlaying = useAudioStore(state => state.currentlyPlaying);

  const cleanedContent = content;

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const newAudio = new Audio(audioUrl);
      
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };
      
      audioRef.current = newAudio;
      
      if (newAudio.duration) {
        setAudioDuration(newAudio.duration);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current && currentlyPlaying !== audioRef.current) {
      setIsPlaying(false);
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    if (
      role === 'assistant' && 
      audioUrl && 
      audioRef.current && 
      dialogOpen && 
      isNewMessage && 
      !hasAutoPlayedRef.current
    ) {
      playAudio(audioRef.current).catch(error => {
        console.error('Error auto-playing audio:', error);
      });
      
      setIsPlaying(true);
      hasAutoPlayedRef.current = true;
    }
  }, [audioUrl, role, dialogOpen, isNewMessage]);

  useEffect(() => {
    if (!dialogOpen && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [dialogOpen, isPlaying]);

  const toggleAudio = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio(audioRef.current).catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };

  const isTranscribedVoice = isVoiceMessage && content !== 'Voice message';

  return (
    <div 
      className={cn(
        "flex items-start gap-2 p-3 mb-2 font-oxanium",
        role === 'user' 
          ? "bg-[#332E38]/10 ml-auto max-w-[80%] rounded-2xl text-[#282828]" 
          : "mr-auto max-w-[80%] text-[#282828]"
      )}
      aria-label={`${role === 'user' ? 'Your' : 'Assistant'} message: ${cleanedContent}`}
    >
      {isVoiceMessage && (
        <Mic className="h-4 w-4 mt-1 text-primary" aria-hidden="true" />
      )}
      
      <div className="flex-1">
        {isTranscribedVoice ? (
          <>
            <p className="text-xs text-muted-foreground mb-1 font-oxanium">Transcribed voice message:</p>
            <p className="text-sm whitespace-pre-wrap text-[#282828] font-oxanium">{cleanedContent}</p>
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-[#282828] font-oxanium">{cleanedContent}</p>
        )}
      </div>
      
      {audioUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-8 w-8 p-0"
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
