
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { stopAllAudio } from '@/services/AudioContext';
import { chatThemes } from './VirgilChatThemes';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import MessageBubble from './MessageBubble';
import ChatInputForm from './ChatInputForm';
import { ChatVariant } from '@/types/chat';

interface VirgilChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ChatVariant;
  initialMessage?: string;
}

const VirgilChatInterface: React.FC<VirgilChatInterfaceProps> = ({ 
  isOpen, 
  onClose,
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

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitMessage();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          "p-0 h-[85vh] md:h-[75vh] rounded-t-xl border-0 overflow-hidden",
          themeColors.background
        )}
      >
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

        <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(85vh-120px)] md:h-[calc(75vh-120px)] font-libre-baskerville">
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
      </SheetContent>
    </Sheet>
  );
};

export default VirgilChatInterface;
