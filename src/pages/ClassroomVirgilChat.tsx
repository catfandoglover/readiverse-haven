import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

interface CourseData {
  id: string;
  title: string;
  description: string;
  progress?: number;
  isDNA?: boolean;
}

const ClassroomVirgilChat = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const courseData = location.state?.courseData as CourseData;
  
  const userName = user ? (user.user_metadata?.full_name || user.email) : 'Student';
  
  const initialMessage = `Welcome, ${userName}! Ready for today's lesson on ${courseData?.title || 'philosophy'}?`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setState('transitioning');
      
      const chatTimer = setTimeout(() => {
        setState('chat');
      }, 500);

      return () => clearTimeout(chatTimer);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleBack = () => {
    navigate('/classroom');
  };

  return (
    <div className="flex flex-col h-screen bg-[#1D3A35] text-[#E9E7E2] overflow-hidden">
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
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#19352F]/50"
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          {courseData?.title || "COURSE"}
        </h2>
        <div className="w-10 h-10" />
      </div>
      
      <div className="flex-1 flex items-center justify-center relative">
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500 px-6",
            state === 'initial' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-libre-baskerville font-bold text-4xl md:text-5xl text-[#E9E7E2] mb-3 uppercase">
            {courseData?.title || "Course"}
          </h1>
          <p className="font-oxanium text-lg text-[#E9E7E2]/70">
            {courseData?.description || "Starting your lesson..."}
          </p>
        </div>
        
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col pt-6">
            <VirgilFullScreenChat 
              variant="classroom"
              initialMessage={initialMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomVirgilChat;
