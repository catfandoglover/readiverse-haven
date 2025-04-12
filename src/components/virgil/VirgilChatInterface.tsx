import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { stopAllAudio } from '@/services/AudioContext';
import { chatThemes } from './VirgilChatThemes';
import MessageBubble from './MessageBubble';
import ChatInputForm from './ChatInputForm';
import { ChatVariant, ChatMessage as UIMessage } from '@/types/chat';

interface VirgilChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ChatVariant;
  messages: UIMessage[];
  inputMessage: string;
  isRecording: boolean;
  isProcessing: boolean;
  isLoadingHistory: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmitMessage: (e: React.FormEvent) => void;
  toggleRecording: () => void;
  cancelRecording: () => void;
}

const VirgilChatInterface: React.FC<VirgilChatInterfaceProps> = ({ 
  isOpen, 
  onClose,
  variant = 'default',
  messages,
  inputMessage,
  isRecording,
  isProcessing,
  isLoadingHistory,
  handleInputChange,
  handleSubmitMessage,
  toggleRecording,
  cancelRecording,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (isLoadingHistory) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className={cn("p-4 h-[85vh] md:h-[75vh] rounded-t-xl border-0 overflow-hidden flex items-center justify-center", themeColors.background)}>
          <div>Loading Chat History...</div> 
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          "p-0 h-[85vh] md:h-[75vh] rounded-t-xl border-0 overflow-hidden flex flex-col",
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

        <div className="flex-1 p-4 pb-2 space-y-4 overflow-y-auto font-libre-baskerville scroll-p-24">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              themeColors={themeColors} 
            />
          ))}
          {isProcessing && !isRecording && (
             <div className="flex justify-start pl-3">
                 <div className="p-2 rounded-lg bg-gray-200 text-gray-500 italic text-sm">
                     Thinking...
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto border-t border-gray-200">
          <ChatInputForm
            inputMessage={inputMessage}
            setInputMessage={handleInputChange}
            handleSubmit={handleSubmitMessage}
            isRecording={isRecording}
            isProcessing={isProcessing}
            toggleRecording={toggleRecording}
            cancelRecording={cancelRecording}
            themeColors={themeColors}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VirgilChatInterface;
