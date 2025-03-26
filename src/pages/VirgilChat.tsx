
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';

interface PromptData {
  id: string | number;
  user_title: string;
  user_subtitle?: string;
  section?: string;
  icon_display?: string;
  context?: string;
  initial_message?: string;
  session_id?: string;
}

interface LocationState {
  promptData?: PromptData;
  isExistingConversation?: boolean;
}

const VirgilChat: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  // Get the prompt data from location state or use default message
  const promptData = locationState?.promptData;
  const initialMessage = promptData?.initial_message || 
    "I'm Virgil, your philosophical guide to humanity's great conversation. How can I help you explore ideas today?";
  
  const isExistingConversation = locationState?.isExistingConversation || false;
  const sessionId = promptData?.session_id;

  // Initial animation timing - skip for existing conversations
  useEffect(() => {
    if (isExistingConversation) {
      setState('chat');
      return;
    }
    
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
  }, [isExistingConversation]);

  const handleBack = () => {
    navigate('/virgil-modes');
  };

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
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          {promptData?.user_title || "VIRGIL"}
        </h2>
        <div className="w-10 h-10" />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Initial centered text */}
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500 px-6",
            (state === 'initial' && !isExistingConversation) ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-baskerville text-4xl md:text-5xl text-[#E9E7E2] mb-3">
            {promptData?.user_title || "Explore Ideas"}
          </h1>
          <p className="font-inter text-lg text-[#E9E7E2]/70">
            {promptData?.user_subtitle || "Chat with Virgil about anything"}
          </p>
        </div>
        
        {/* Chat interface - only shows after transition */}
        {(state === 'chat' || isExistingConversation) && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="virgilchat"
              initialMessage={initialMessage}
              resultsReady={false}
              sessionIdProp={sessionId}
              promptData={promptData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirgilChat;
