
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { cn } from '@/lib/utils';

interface ExamData {
  id: string;
  title: string;
  description: string;
  score?: number;
}

const ExamVirgilChat: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const examData = location.state?.examData as ExamData;
  
  // Initial message based on exam data
  const initialMessage = `Welcome, ${user?.Account?.Name?.split(' ')[0] || 'student'}! Ready to test your knowledge on ${examData?.title || 'philosophy'}?`;

  // Initial animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setState('transitioning');
      
      // Allow time for header transition before showing chat
      const chatTimer = setTimeout(() => {
        setState('chat');
      }, 500); // 500ms for the header transition

      return () => clearTimeout(chatTimer);
    }, 2000); // 2 seconds for initial display

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleBack = () => {
    navigate('/exam-room');
  };

  return (
    <div className="flex flex-col h-screen bg-[#3D3D6F] text-[#E9E7E2] overflow-hidden">
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
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#373763]/50"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          {examData?.title || "EXAM"}
        </h2>
        <div className="w-10 h-10" />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Initial centered text */}
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500 px-6",
            state === 'initial' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-baskerville text-4xl md:text-5xl text-[#E9E7E2] mb-3">
            {examData?.title || "Exam"}
          </h1>
          <p className="font-inter text-lg text-[#E9E7E2]/70">
            {examData?.description || "Testing your knowledge..."}
          </p>
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="examroom"
              initialMessage={initialMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamVirgilChat;
