
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { stopAllAudio } from '@/services/AudioContext';
import { chatThemes } from './VirgilChatThemes';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import MessageBubble from './MessageBubble';
import ChatInputForm from './ChatInputForm';
import { ChatVariant } from '@/types/chat';

interface VirgilFullScreenChatProps {
  variant?: ChatVariant;
  initialMessage?: string;
}

const VirgilFullScreenChat: React.FC<VirgilFullScreenChatProps> = ({ 
  variant = 'default',
  initialMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    toggleRecording,
    handleSubmitMessage
  } = useVirgilChat(initialMessage);

  const themeColors = chatThemes[variant];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitMessage();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        themeColors.border
      )}>
        <div className="w-6" />
        <h2 className={cn(
          "font-oxanium text-sm font-bold tracking-wider uppercase",
          themeColors.text
        )}>
          Virgil's Office
        </h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            themeColors={themeColors} 
          />
        ))}
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
      />
    </div>
  );
};

export default VirgilFullScreenChat;
