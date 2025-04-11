import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming course_id is in URL params
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import { virgilConfig } from '@/config/virgilConfig';
// Assume a UI component exists for rendering the chat
import VirgilChatUI from './VirgilChatUI'; // Adjust path if necessary
import { VirgilInstanceType } from '@/types/virgil';
import { fetchPromptByPurposeOrId } from '@/utils/promptUtils'; // Assume a utility exists to fetch prompts
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Assume a loading component

interface VirgilFullScreenWrapperProps {
  // Add any specific props needed, e.g., maybe course data is passed directly
}

// Example: Fetching a course-specific prompt (replace with actual logic)
// This might involve a dedicated hook or fetching from a specific table/endpoint.
async function getCourseSystemPrompt(courseId: string): Promise<string> {
  // Option 1: Fetch from prompts table using a specific purpose/context related to the course
  // const promptData = await fetchPromptByPurposeOrId({ purpose: `course_${courseId}_prompt` });
  // return promptData?.prompt || "You are a helpful assistant for this course.";

  // Option 2: Construct dynamically (Placeholder)
  return `You are Virgil, an AI assistant guiding the user through course ${courseId}. Help them understand the material and achieve their learning objectives.`;
}

const VirgilFullScreenWrapper: React.FC<VirgilFullScreenWrapperProps> = (props) => {
  const { user } = useAuth();
  const { course_id } = useParams<{ course_id: string }>(); // Get course_id from route

  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  // Define the instance type we are wrapping
  const instanceType: VirgilInstanceType = 'COURSE_CHAT';
  const config = virgilConfig[instanceType];

  // Fetch the system prompt based on the course context
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPrompt(true);
    if (course_id && config.promptSource === 'course_context') {
      getCourseSystemPrompt(course_id)
        .then((prompt) => {
          if (isMounted) {
            setSystemPrompt(prompt);
          }
        })
        .catch((err) => {
          console.error("Error fetching course system prompt:", err);
          if (isMounted) {
            setSystemPrompt('Error loading prompt. Using default.'); // Fallback prompt
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingPrompt(false);
          }
        });
    } else {
       // Handle cases where prompt source isn't course_context or course_id is missing
       // This shouldn't happen if used correctly for COURSE_CHAT
       console.error('Invalid config or context for Course Chat wrapper');
       setSystemPrompt('Default course assistant prompt.'); 
       setIsLoadingPrompt(false);
    }

    return () => { isMounted = false; };
  }, [course_id, config.promptSource]);

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
    systemPrompt: systemPrompt || '', // Pass loaded prompt, or empty string while loading
    storageTable: config.storageTable,
    contextIdentifiers: { course_id }, // Pass the specific course ID
    isResumable: config.isResumable,
    // conversationIdToLoad: undefined, // Not loading specific ID here
    // initialMessageOverride: undefined,
  });

  // Display loading states
  if (isLoadingPrompt || !systemPrompt || isLoadingHistory) {
    // Add a more robust loading UI if desired
    return <LoadingSpinner message="Loading Course Chat..." />;
  }

  // Render the actual Chat UI with the hook's state and handlers
  return (
    <div className="h-full w-full flex flex-col"> 
      {/* Add any course-specific header or context here if needed */}
      <VirgilChatUI
        messages={messages}
        inputMessage={inputMessage}
        isRecording={isRecording}
        isProcessing={isProcessing} // Combined processing state
        isLoading={isLoadingHistory || isLoadingPrompt} // Combine loading states for UI
        handleInputChange={handleInputChange}
        handleSubmitMessage={handleSubmitMessage}
        toggleRecording={toggleRecording}
        cancelRecording={cancelRecording}
        // Pass any other necessary props to VirgilChatUI
      />
    </div>
  );
};

export default VirgilFullScreenWrapper; 
