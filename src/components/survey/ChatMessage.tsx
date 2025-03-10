import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Automatically play audio for assistant messages when they appear
  useEffect(() => {
    if (role === 'assistant' && audioUrl && !audio) {
      const newAudio = new Audio(audioUrl);
      
      // Set up event listeners
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onplay = () => setIsPlaying(true);
      
      // Store the audio element
      setAudio(newAudio);
      
      // Play the audio automatically
      newAudio.play().catch(error => {
        console.error('Error auto-playing audio:', error);
        setIsPlaying(false);
      });
      
      setIsPlaying(true);
    }
  }, [audioUrl, role, audio]);

  // Handle manual play/pause audio
  const toggleAudio = () => {
    if (!audioUrl) return;

    if (!audio) {
      // Create new audio element
      const newAudio = new Audio(audioUrl);
      
      // Set up event listeners
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onplay = () => setIsPlaying(true);
      
      // Store the audio element
      setAudio(newAudio);
      
      // Play the audio
      newAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
      
      setIsPlaying(true);
    } else {
      // Toggle existing audio
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

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
