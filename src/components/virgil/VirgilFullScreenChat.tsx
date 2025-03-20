
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
            <button
              onClick={onViewResults}
              className="h-[52px] px-8 rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 border border-[#373763] transition-colors duration-200"
            >
              SEE MY RESULTS
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={cn(
        "transition-transform duration-500 ease-in-out",
        resultsReady ? "transform translate-y-full" : ""
      )}>
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
    </div>
  );
};

export default VirgilFullScreenChat;
