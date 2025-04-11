import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { virgilConfig } from '@/config/virgilConfig';
import { VirgilInstanceType } from '@/types/virgil';
import { fetchPromptByPurposeOrId } from '@/utils/promptUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface PromptData {
  id: string | number;
  user_title: string;
  user_subtitle?: string;
  section?: string;
  icon_display?: string;
  context?: string;
  initial_message: string;
}

interface LocationState {
  promptData?: PromptData;
}

const VirgilChat: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const locationState = location.state as LocationState;
  
  // Get the prompt data from location state or use default message
  const promptData = locationState?.promptData;
  const initialMessage = promptData?.initial_message || 
    "I'm Virgil, your philosophical guide to humanity's great conversation. How can I help you explore ideas today?";

  // Define the instance type
  const instanceType: VirgilInstanceType = 'GENERAL_CHAT';
  const config = virgilConfig[instanceType];

  // Fetch the actual system prompt
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPrompt(true);
    if (promptData?.id) {
      // Assuming promptData passed from /virgil-modes includes the ID
      // Fetch the full prompt data including the system prompt text
      fetchPromptByPurposeOrId({ id: String(promptData.id) }) // Ensure ID is string if needed
        .then((fullPromptData) => {
          if (isMounted) {
            if (fullPromptData?.prompt) {
              setSystemPrompt(fullPromptData.prompt);
            } else {
              console.warn(`System prompt not found for ID: ${promptData.id}`);
              setSystemPrompt('Default chat prompt.'); // Fallback
            }
            setIsLoadingPrompt(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching system prompt:", err);
          if (isMounted) {
            setSystemPrompt('Error loading prompt.');
            setIsLoadingPrompt(false);
          }
        });
    } else {
      console.error('No promptData.id found in location state for VirgilChat');
      setSystemPrompt('Default chat prompt.'); // Fallback
      setIsLoadingPrompt(false);
    }
    return () => { isMounted = false; };
  }, [promptData?.id]);

  // Initial animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setState('transitioning');
      
      // Allow time for header transition before showing chat
      const chatTimer = setTimeout(() => {
        setState('chat');
      }, 500); // 500ms for the header transition

      return () => clearTimeout(chatTimer);
    }, 2500); // 2.5 seconds for initial display

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleBack = () => {
    navigate('/virgil-modes');
  };

  // Use promptData's initial_message as the override for the hook
  const initialMessageOverride = promptData?.initial_message;

  // Loading state before rendering chat
  if (isLoadingPrompt || !systemPrompt) {
      return (
          <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] items-center justify-center">
              <LoadingSpinner message="Loading Chat..." />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2] overflow-hidden">
      {/* Header - initially invisible, appears during transition */}
      <div 
        className={cn(
          "flex items-center pt-4 px-4 h-14",
          "transition-opacity duration-500",
          state === 'initial' ? 'opacity-0' : 'opacity-100'
        )}
      >
        <Button
          variant="ghost" 
          size="icon"
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none hover:bg-transparent"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          {promptData?.user_title || "VIRGIL"}
        </h2>
        <div className="w-10 h-10" />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative pt-6">
        {/* Initial centered text */}
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500 px-6",
            state === 'initial' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-libre-baskerville font-bold text-4xl md:text-5xl text-[#E9E7E2] mb-3 uppercase">
            {promptData?.user_title || "Explore Ideas"}
          </h1>
          <p className="font-oxanium text-lg text-[#E9E7E2]/70">
            {promptData?.user_subtitle || "Chat with Virgil about anything"}
          </p>
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col pt-6">
            <VirgilFullScreenChat 
              userId={user?.id}
              systemPrompt={systemPrompt}
              storageTable={config.storageTable}
              contextIdentifiers={{ prompt_id: String(promptData?.id) }}
              isResumable={config.isResumable}
              initialMessageOverride={initialMessageOverride}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirgilChat;
