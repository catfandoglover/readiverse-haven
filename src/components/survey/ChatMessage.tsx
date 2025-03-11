import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayedRef = useRef(false);

  // Create audio element when audioUrl is available
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const newAudio = new Audio(audioUrl);
      
      // Set up event listeners
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onplay = () => setIsPlaying(true);
      
      // Store the audio element
      audioRef.current = newAudio;
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

  return (
    <div className={`ai-chat-message ${role} flex items-start gap-2`}>
      <div className="flex-1">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      
      {audioUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-8 w-8 p-0"
          onClick={toggleAudio}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
        </Button>
      )}
    </div>
  );
};

export default ChatMessage; 
