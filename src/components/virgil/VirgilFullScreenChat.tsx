import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { stopAllAudio } from '@/services/AudioContext';
import { chatThemes } from './VirgilChatThemes';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import MessageBubble from './MessageBubble';
import ChatInputForm from './ChatInputForm';
import { ChatVariant } from '@/types/chat';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";

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

  // Calculate safe padding - base of 24 (6rem) plus height of composer form
  const composerHeight = 72; // Typical height of the composer form is around 72px (4.5rem)
  const safePadding = `${composerHeight + 32}px`; // 72px + 32px extra space = 104px

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Add more padding at bottom to prevent overlap */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto font-libre-baskerville" style={{ paddingBottom: safePadding }}>
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            themeColors={themeColors} 
          />
        ))}
        
        {resultsReady && (
          <div className="flex justify-center mt-8 mb-8">
            <button
              onClick={onViewResults}
              className="h-[52px] px-8 rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 transition-colors duration-200"
            >
              SEE MY RESULTS
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className={cn(
        "mt-auto fixed bottom-0 left-0 right-0 w-full transition-all duration-500 ease-in-out z-10",
        resultsReady 
          ? "transform translate-y-full opacity-0 pointer-events-none" 
          : "opacity-100"
      )}>
        <div className="mb-0 rounded-t-2xl overflow-hidden">
          <ChatInputForm
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSubmit={handleSubmit}
            isRecording={isRecording}
            isProcessing={isProcessing}
            toggleRecording={toggleRecording}
            themeColors={themeColors}
            disabled={disableChat}
          />
        </div>
      </div>
    </div>
  );
};

export default VirgilFullScreenChat;
