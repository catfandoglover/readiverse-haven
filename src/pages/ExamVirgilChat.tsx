import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

interface ExamData {
  id: string;
  title: string;
  description: string;
  score?: number;
  isRetake?: boolean;
}

const ExamVirgilChat: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const examData = location.state?.examData as ExamData;
  
  const userName = user ? (user.user_metadata?.full_name || user.email) : 'Student';
  const userEmail = user?.email;
  
  const initialMessage = examData?.isRetake
    ? `Welcome back, ${userName}! Let's retake the ${examData?.title || 'philosophy'} exam.`
    : `Welcome, ${userName}! Ready to test your knowledge on ${examData?.title || 'philosophy'}?`;

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
    setShowExitDialog(true);
  };
  
  const handleConfirmExit = () => {
    setShowExitDialog(false);
    navigate('/exam-room');
  };
  
  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#3D3D6F] text-[#E9E7E2] overflow-hidden">
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
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          {examData?.title || "EXAM"}
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
            {examData?.title || "Exam"}
          </h1>
          <p className="font-oxanium text-lg text-[#E9E7E2]/70">
            {examData?.description || "Testing your knowledge..."}
          </p>
        </div>
        
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col pt-6">
            <VirgilFullScreenChat 
              variant="examroom"
              initialMessage={initialMessage}
            />
          </div>
        )}
      </div>
      
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              If you leave now, you'll need to start this exam over from the beginning next time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExit}>
              Stay Here
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Exit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamVirgilChat;
