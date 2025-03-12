import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      // Play the audio automatically only once
      audioRef.current.play().catch(error => {
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
    } else {
      audioRef.current.play().catch(error => {
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
        "flex items-start gap-2 p-3 rounded-lg",
        role === 'user' 
          ? "bg-primary/10 ml-auto max-w-[80%]" 
          : "bg-secondary/80 mr-auto max-w-[80%]",
        isVoiceMessage && "bg-primary/20"
      )}
      aria-label={`${role === 'user' ? 'Your' : 'Assistant'} message: ${cleanedContent}`}
    >
      {isVoiceMessage && (
        <Mic className="h-4 w-4 mt-1 text-primary" aria-hidden="true" />
      )}
      
      <div className="flex-1">
        {isTranscribedVoice ? (
          <>
            <p className="text-xs text-muted-foreground mb-1">Transcribed voice message:</p>
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
