
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { stopAllAudio } from '@/services/AudioContext';
import { chatThemes } from './VirgilChatThemes';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import MessageBubble from './MessageBubble';
import ChatInputForm from './ChatInputForm';
import { ChatVariant } from '@/types/chat';
import { Button } from "@/components/ui/button";

interface VirgilFullScreenChatProps {
  variant?: ChatVariant;
  initialMessage?: string;
  resultsReady?: boolean;
  onViewResults?: () => void;
  disableChat?: boolean;
}

const VirgilFullScreenChat: React.FC<VirgilFullScreenChatProps> = ({ 
  variant = 'default',
  initialMessage,
  resultsReady = false,
  onViewResults,
  disableChat = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    toggleRecording,
    handleSubmitMessage,
    addAssistantMessage
  } = useVirgilChat(initialMessage);

  const themeColors = chatThemes[variant];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to add the "results ready" message when resultsReady changes to true
  useEffect(() => {
    if (resultsReady) {
      addAssistantMessage("Your DNA results are now ready to explore. Click the button below to see your intellectual profile.");
    }
  }, [resultsReady, addAssistantMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitMessage();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            themeColors={themeColors} 
          />
        ))}
        
        {resultsReady && (
          <div className="flex justify-center mt-8">
            <Button 
              variant="virgil"
              size="lg"
              className="animate-pulse"
              onClick={onViewResults}
            >
              SEE MY RESULTS
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInputForm
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSubmit={handleSubmit}
        isRecording={isRecording}
        isProcessing={isProcessing}
        toggleRecording={toggleRecording}
        themeColors={themeColors}
        disabled={disableChat || resultsReady}
      />
    </div>
  );
};

export default VirgilFullScreenChat;
