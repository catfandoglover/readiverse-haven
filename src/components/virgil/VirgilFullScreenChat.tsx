import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import VirgilChatUI from './VirgilChatUI';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface VirgilFullScreenChatProps {
  userId: string | null | undefined;
  systemPrompt: string;
  storageTable: string;
  contextIdentifiers: Record<string, any>;
  isResumable: boolean;
  initialMessageOverride?: string;
  variant?: string;
}

const VirgilFullScreenChat: React.FC<VirgilFullScreenChatProps> = ({
  userId,
  systemPrompt,
  storageTable,
  contextIdentifiers,
  isResumable,
  initialMessageOverride,
  variant = 'default',
}) => {
  const {
    messages,
    inputMessage,
    isRecording,
    isProcessing,
    isLoadingHistory,
    handleInputChange,
    handleSubmitMessage,
    toggleRecording,
    cancelRecording,
  } = useVirgilChat({
    userId,
    systemPrompt,
    storageTable,
    contextIdentifiers,
    isResumable,
    initialMessageOverride,
  });

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner message="Loading Conversation..." />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full w-full",
    )}>
      <VirgilChatUI 
        messages={messages}
        inputMessage={inputMessage}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isLoading={isLoadingHistory}
        handleInputChange={handleInputChange}
        handleSubmitMessage={handleSubmitMessage}
        toggleRecording={toggleRecording}
        cancelRecording={cancelRecording}
      />
    </div>
  );
};

export default VirgilFullScreenChat;
