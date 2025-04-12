import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // Assuming course_id is in URL params
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useVirgilChat } from '@/hooks/useVirgilChat';
import { virgilConfig } from '@/config/virgilConfig';
// Assume a UI component exists for rendering the chat
import VirgilChatUI from './VirgilChatUI'; // Adjust path if necessary
import { VirgilInstanceType } from '@/types/virgil';
// Import the prompt fetching utility
import { fetchPromptByPurposeOrId } from '@/utils/promptUtils'; 
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Assume a loading component

// *** ADDED: Define type for courseData from location state ***
interface CourseDataState {
  entryId: string;
  entryType: 'book' | 'icon' | 'concept';
  title: string;
  description: string;
}

interface VirgilFullScreenWrapperProps {
  // Add any specific props needed, e.g., maybe course data is passed directly
}

const VirgilFullScreenWrapper: React.FC<VirgilFullScreenWrapperProps> = (props) => {
  const { user } = useAuth();
  const { course_id } = useParams<{ course_id: string }>(); // Get course_id from route
  // *** ADDED: Get location and courseData from state ***
  const location = useLocation();
  const courseData = location.state?.courseData as CourseDataState | undefined;

  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  // Define the instance type we are wrapping
  const instanceType: VirgilInstanceType = 'COURSE_CHAT';
  const config = virgilConfig[instanceType];

  // *** REPLACED: useEffect to use courseData for dynamic prompt generation ***
  useEffect(() => {
    setIsLoadingPrompt(true);

    const generateSystemPrompt = (data: CourseDataState): string => {
      // More sophisticated prompt generation can be done here
      return `You are an expert tutor discussing the ${data.entryType}: "${data.title}".\n\nKey information:\n${data.description}\n\nFocus your conversation on helping the user understand this specific topic. Guide them through the core ideas, nuances, and connections to other concepts or thinkers where relevant.`;
    };

    if (courseData) {
      const dynamicPrompt = generateSystemPrompt(courseData);
      console.log("Setting dynamic course prompt (start):", dynamicPrompt.substring(0, 150) + "...");
      setSystemPrompt(dynamicPrompt);
    } else {
      // Handle missing courseData - this shouldn't happen if navigation is correct
      console.error("Course data missing in location state! Cannot generate specific prompt.");
      // Set a generic fallback prompt or an error state
      setSystemPrompt("Welcome to the course chat. Please ensure you've selected a course correctly."); 
    }

    setIsLoadingPrompt(false);

  // Depend on courseData obtained from location state
  // Note: course_id from params is used later for useVirgilChat context
  }, [courseData]);

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
