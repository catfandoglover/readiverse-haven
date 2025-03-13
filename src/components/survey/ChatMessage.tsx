
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { playAudio, stopAllAudio } from '@/services/AudioContext';

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
  
  // Clean any special characters that might be causing issues
  const cleanedContent = content;

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      console.log('Creating new audio element with URL:', audioUrl);
      const newAudio = new Audio(audioUrl);
      
      newAudio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      };
      newAudio.onpause = () => {
        console.log('Audio playback paused');
        setIsPlaying(false);
      };
      newAudio.onplay = () => {
        console.log('Audio playback started');
        setIsPlaying(true);
      };
      newAudio.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', newAudio.duration);
        setAudioDuration(newAudio.duration);
      };
      newAudio.onerror = (e) => {
        console.error('Audio load error:', e);
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
    if (
      role === 'assistant' && 
      audioUrl && 
      audioRef.current && 
      dialogOpen && 
      isNewMessage && 
      !hasAutoPlayedRef.current
    ) {
      console.log('Auto-playing audio for new message');
      
      // Try regular play first
      audioRef.current.play().catch(error => {
        console.error('Error auto-playing audio using standard method:', error);
        
        // If standard play fails, try the playAudio helper
        try {
          if (audioRef.current) {
            playAudio(audioRef.current).catch(fallbackError => {
              console.error('Error auto-playing audio with fallback method:', fallbackError);
            });
          }
        } catch (helperError) {
          console.error('Error with audio helper:', helperError);
        }
      });
      
      setIsPlaying(true);
      hasAutoPlayedRef.current = true;
    }
  }, [audioUrl, role, dialogOpen, isNewMessage]);

  useEffect(() => {
    if (!dialogOpen && audioRef.current && isPlaying) {
      console.log('Dialog closed, stopping audio playback');
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [dialogOpen, isPlaying]);

  const toggleAudio = () => {
    if (!audioUrl || !audioRef.current) {
      console.log('No audio available to toggle');
      return;
    }

    if (isPlaying) {
      console.log('Pausing audio playback');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('Starting audio playback');
      
      // Try regular play first
      audioRef.current.play().catch(error => {
        console.error('Error playing audio using standard method:', error);
        
        // If standard play fails, try the playAudio helper
        try {
          if (audioRef.current) {
            playAudio(audioRef.current).catch(fallbackError => {
              console.error('Error playing audio with fallback method:', fallbackError);
              setIsPlaying(false);
            });
          }
        } catch (helperError) {
          console.error('Error with audio helper:', helperError);
          setIsPlaying(false);
        }
      });
      
      setIsPlaying(true);
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
