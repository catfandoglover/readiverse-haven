import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import VirgilChatUI from './VirgilChatUI';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { virgilConfig } from '@/config/virgilConfig';
import { fetchPromptByPurposeOrId } from '@/utils/promptUtils';
import { VirgilInstanceType } from '@/types/virgil';

interface VirgilFullScreenChatProps {
  variant?: 'classroom' | 'exam' | 'default';
  initialMessage?: string;
  promptId?: string;
  examId?: string;
  courseIdFromParams?: string;
}

const VirgilFullScreenChat: React.FC<VirgilFullScreenChatProps> = ({
  variant = 'default',
  initialMessage,
  promptId,
  examId,
  courseIdFromParams,
}) => {
  const { user } = useAuth();
  const [systemPrompt, setSystemPrompt] = React.useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = React.useState(true);

  const instanceType: VirgilInstanceType = variant === 'classroom' ? 'COURSE_CHAT' 
                                        : variant === 'exam' ? 'EXAM_CHAT' 
                                        : 'GENERAL_CHAT';
  const config = virgilConfig[instanceType];

  const contextIdentifiers: Record<string, any> = {};
  if (courseIdFromParams) {
    contextIdentifiers.course_id = courseIdFromParams;
  } else if (examId) {
    contextIdentifiers.exam_id = examId; 
  } else if (promptId) {
    contextIdentifiers.prompt_id = promptId;
  }

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingPrompt(true);
    let fetchArgs: Parameters<typeof fetchPromptByPurposeOrId>[0] = {};
    let fallbackPrompt = "Default Assistant Prompt";

    switch (config.promptSource) {
        case 'prompt_id':
            const idToFetch = promptId || examId;
            if (idToFetch) {
                if (promptId) fetchArgs = { id: promptId };
                else if (examId) fetchArgs = { purpose: examId, context: 'exam' };
            } else {
                 console.warn(`[${instanceType}] promptSource is 'prompt_id' but no promptId or examId provided.`);
            }
            break;
        case 'course_context':
            if (courseIdFromParams) {
                fetchArgs = { purpose: 'course_creation', context: 'classroom' };
            } else {
                 console.warn(`[${instanceType}] promptSource is 'course_context' but no courseIdFromParams provided.`);
            }
            break;
        case 'book_context':
             console.warn(`[${instanceType}] promptSource 'book_context' not implemented yet.`);
             break;
        default:
             console.error(`[${instanceType}] Unknown promptSource: ${config.promptSource}`);
    }

    if (Object.keys(fetchArgs).length > 0) {
      console.log(`[${instanceType}] Fetching prompt with args:`, fetchArgs);
      fetchPromptByPurposeOrId(fetchArgs)
        .then((promptData) => {
          if (isMounted) {
            const fetchedPrompt = promptData?.prompt;
            console.log(`[${instanceType}] Fetched Prompt (start):`, fetchedPrompt?.substring(0, 100) + "...");
            setSystemPrompt(fetchedPrompt || fallbackPrompt);
          }
        })
        .catch((err) => {
          console.error(`Error fetching system prompt for ${instanceType}:`, err);
          if (isMounted) {
            console.log(`[${instanceType}] Using fallback prompt due to error.`);
            setSystemPrompt(fallbackPrompt);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingPrompt(false);
        });
    } else {
      console.warn(`[${instanceType}] No valid prompt fetch arguments derived. Using fallback.`);
      setSystemPrompt(fallbackPrompt);
      setIsLoadingPrompt(false);
    }

    return () => { isMounted = false; };
  }, [config.promptSource, promptId, courseIdFromParams, examId, instanceType]);

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
    userId: user?.id,
    systemPrompt: systemPrompt || '',
    storageTable: config.storageTable,
    contextIdentifiers,
    isResumable: config.isResumable,
    initialMessageOverride: initialMessage,
  });

  if (isLoadingPrompt || !systemPrompt || isLoadingHistory) {
    return <LoadingSpinner message={`Loading ${variant} Chat...`} />;
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
        isLoading={isLoadingHistory || isLoadingPrompt}
        handleInputChange={handleInputChange}
        handleSubmitMessage={handleSubmitMessage}
        toggleRecording={toggleRecording}
        cancelRecording={cancelRecording}
      />
    </div>
  );
};

export default VirgilFullScreenChat;
