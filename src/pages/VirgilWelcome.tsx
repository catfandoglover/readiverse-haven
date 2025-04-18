import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import VirgilFullScreenChat from '@/components/virgil/VirgilFullScreenChat';
import conversationManager from '@/services/ConversationManager';
import ExistingAssessmentDialog from '@/components/dna/ExistingAssessmentDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const VirgilWelcome: React.FC = () => {
  const [state, setState] = useState<'initial' | 'transitioning' | 'chat'>('initial');
  const [resultsReady, setResultsReady] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for existing assessment dialog
  const [showExistingAssessmentDialog, setShowExistingAssessmentDialog] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState<string>('');
  const [pendingAssessmentId, setPendingAssessmentId] = useState<string>('');

  // Check for existing assessment on component mount
  useEffect(() => {
    const checkForExistingAssessment = async () => {
      if (!user) return;
      
      try {
        // Check profile for assessment_id
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('assessment_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // Check for pending assessment
        const pendingId = localStorage.getItem('pending_dna_assessment_id');
        
        // If user has both existing and pending assessments, show dialog
        if (profileData?.assessment_id && pendingId) {
          setExistingAssessmentId(profileData.assessment_id);
          setPendingAssessmentId(pendingId);
          setShowExistingAssessmentDialog(true);
          
          // Show dialog for 3 seconds, then route to profile
          setTimeout(() => {
            setShowExistingAssessmentDialog(false);
            
            // Clear pending assessment ID
            localStorage.removeItem('pending_dna_assessment_id');
            sessionStorage.removeItem('dna_assessment_to_save');
            
            // Navigate to profile
            navigate('/profile');
          }, 3000); // 3 seconds
          
          return;
        }
      } catch (error) {
        console.error('Error checking for existing assessment:', error);
      }
    };
    
    checkForExistingAssessment();
  }, [user, navigate]);

  // Initial animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setState('transitioning');
      
      // Allow time for header transition before showing chat
      const chatTimer = setTimeout(() => {
        setState('chat');
      }, 500); // 500ms for the header transition

      return () => clearTimeout(timer);
    }, 2500); // 2.5 seconds for initial display

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  // Two-minute timer for DNA results
  useEffect(() => {
    if (state === 'chat') {
      const resultsTimer = setTimeout(async () => {
        setResultsReady(true);
        
        // Wait 3 seconds after showing the completion message before navigating
        setTimeout(async () => {
          // Automatically save conversation and navigate
          try {
            const sessionId = Math.random().toString(36).substring(2, 15);
            await conversationManager.saveConversationToSupabase(
              sessionId,
              "dna-welcome",
              null,
              "welcome"
            );
          } catch (error) {
            console.error('Error saving conversation:', error);
          }
          
          // Navigate to profile page
          navigate('/profile?tab=profile');
        }, 3000); // 3 second delay
      }, 120000); // 2 minutes (120,000 ms)
      
      return () => clearTimeout(resultsTimer);
    }
  }, [state, navigate]);

  // Save conversation and handle navigation
  const handleViewResults = async () => {
    try {
      // Save the conversation to Supabase
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Save the conversation to Supabase
      await conversationManager.saveConversationToSupabase(
        sessionId,
        "dna-welcome",
        null, // userId 
        "welcome"
      );
      
      // Navigate to the profile page with profile tab
      navigate('/profile?tab=profile');
    } catch (error) {
      console.error('Error saving conversation:', error);
      navigate('/profile?tab=profile');
    }
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
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/70 tracking-wider text-sm font-bold mx-auto">
          VIRGIL
        </h2>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Initial centered text */}
        <div 
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500",
            state === 'initial' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-20 pointer-events-none'
          )}
        >
          <h1 className="font-libre-baskerville font-bold text-4xl md:text-5xl text-[#E9E7E2] mb-3">Meet Virgil.</h1>
          <p className="font-inter text-lg text-[#E9E7E2]/70">Your Philosophical Guide</p>
        </div>
        
        {/* Chat interface - only shows after transition */}
        {state === 'chat' && (
          <div className="absolute inset-0 flex flex-col">
            <VirgilFullScreenChat 
              variant="virgilchat"
              initialMessage="I'm Virgil, your philosophical guide to humanity's great conversation. Your intellectual DNA results are processing in our ideas lab. I'll let you know when they're ready. In the meantime, how was that experience for you?"
              resultsReady={resultsReady}
              onViewResults={handleViewResults}
              disableChat={resultsReady}
            />
          </div>
        )}
      </div>
      
      {/* Existing Assessment Dialog */}
      <ExistingAssessmentDialog
        open={showExistingAssessmentDialog}
        onOpenChange={setShowExistingAssessmentDialog}
        existingAssessmentId={existingAssessmentId}
        pendingAssessmentId={pendingAssessmentId}
      />
    </div>
  );
};

export default VirgilWelcome;
