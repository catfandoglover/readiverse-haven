import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "sonner";
import AIChatButton from '@/components/survey/AIChatButton';
import AIChatDialog from '@/components/survey/AIChatDialog';
import conversationManager from '@/services/ConversationManager';
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Check, LogIn, UserPlus, X } from "lucide-react";
import TidyCalDialog from "@/components/booking/TidyCalDialog";
import { useTidyCalBooking } from "@/components/booking/useTidyCalBooking";
import { Database } from "@/integrations/supabase/types";

type DNACategory = Database["public"]["Enums"]["dna_category"];

const categoryOrder: DNACategory[] = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
];

const TOTAL_QUESTIONS = 30; // 5 questions per category × 6 categories

const DNAAssessment = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPosition, setCurrentPosition] = useState("Q1");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [answers, setAnswers] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiEnabled, setAIEnabled] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [completedAssessmentId, setCompletedAssessmentId] = useState<string | null>(null);
  const { user, openLogin, openSignup } = useAuth();
  const isMobile = useIsMobile();
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const { showBookingDialog, openBookingDialog, closeBookingDialog } = useTidyCalBooking();

  // Memoize the upper category to prevent unnecessary re-renders
  const upperCategory = React.useMemo(() => 
    category?.toUpperCase() as DNACategory, 
    [category]
  );

  // Memoize the current category index to prevent unnecessary re-renders
  const currentCategoryIndex = React.useMemo(() => 
    categoryOrder.findIndex(cat => cat === upperCategory), 
    [upperCategory]
  );

  const nextCategory = React.useMemo(() => 
    currentCategoryIndex < categoryOrder.length - 1 
      ? categoryOrder[currentCategoryIndex + 1] 
      : null,
    [currentCategoryIndex]
  );

  const progressPercentage = (currentQuestionNumber / TOTAL_QUESTIONS) * 100;

  // Initialize assessment
  const initializeAssessment = useCallback(async () => {
    if (assessmentId || currentCategoryIndex !== 0) {
      setIsInitializing(false);
      return;
    }
    
    try {
      setIsInitializing(true);
      const name = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      let userProfileId = null;
      
      const storedAssessmentId = sessionStorage.getItem('dna_assessment_id');
      if (storedAssessmentId) {
        console.log('Found stored assessment ID:', storedAssessmentId);
        setAssessmentId(storedAssessmentId);
        setIsInitializing(false);
        return;
      }
      
      // Handle authentication
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          
          const allowAnonymous = true;
          if (allowAnonymous) {
            console.log('Continuing in anonymous mode');
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          } else {
            setShowLoginPrompt(true);
            setIsInitializing(false);
            return;
          }
        } else if (userData && userData.user) {
          console.log('Current user:', userData.user);
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', userData.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Error getting profile:', profileError);
              sessionStorage.setItem('user_id', userData.user.id);
            } else if (profileData) {
              console.log('Found profile:', profileData);
              userProfileId = profileData.id;
              setProfileId(userProfileId);
              sessionStorage.setItem('user_id', userProfileId);
            } else {
              console.log('No profile found, using auth user ID as fallback');
              sessionStorage.setItem('user_id', userData.user.id);
            }
          } catch (profileError) {
            console.error('Error in profile check:', profileError);
            sessionStorage.setItem('user_id', userData.user.id);
          }
        } else {
          console.log('No authenticated user, using temporary ID');
          const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('user_id', tempId);
        }
      } catch (authError) {
        console.error('Error in auth check:', authError);
        const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('user_id', tempId);
      }
      
      // Create assessment record
      try {
        const assessmentData = { 
          name,
          answers: {},
          profile_id: userProfileId,
          ethics_sequence: '',
          epistemology_sequence: '',
          politics_sequence: '',
          theology_sequence: '',
          ontology_sequence: '',
          aesthetics_sequence: ''
        };
        
        if (!userProfileId) {
          delete assessmentData.profile_id;
        }
        
        const { data: newAssessment, error: createError } = await supabase
          .from('dna_assessment_results')
          .insert([assessmentData])
          .select()
          .maybeSingle();

        if (createError) {
          throw new Error(`Error creating assessment: ${createError.message}`);
        }

        if (!newAssessment) {
          throw new Error('No assessment created');
        }

        setAssessmentId(newAssessment.id);
        console.log('Created new assessment with ID:', newAssessment.id);
        sessionStorage.setItem('dna_assessment_id', newAssessment.id);
        
        // Verify assessment was created
        const { data: verifyData, error: verifyError } = await supabase
          .from('dna_assessment_results')
          .select('id')
          .eq('id', newAssessment.id)
          .maybeSingle();

        if (verifyError || !verifyData) {
          throw new Error(`Error verifying assessment: ${verifyError?.message || 'Assessment not found'}`);
        }

        console.log('Verified assessment exists:', verifyData);
      } catch (dbError) {
        console.error('Database error during initialization:', dbError);
        throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in assessment initialization:', error);
      setInitializationError(error instanceof Error ? error.message : 'Unknown error during initialization');
      toast.error('Error initializing assessment');
    } finally {
      setIsInitializing(false);
    }
  }, [assessmentId, currentCategoryIndex]);

  // Use effect for initialization
  useEffect(() => {
    initializeAssessment();
  }, [initializeAssessment]);

  // Optimized question fetching with error handling
  const { data: currentQuestion, isLoading: questionLoading, error: questionError } = useQuery({
    queryKey: ['dna-question', upperCategory, currentPosition],
    queryFn: async () => {
      console.log('Fetching question for:', { upperCategory, currentPosition });
      
      if (!upperCategory) {
        throw new Error('Category is required');
      }

      try {
        const { data, error } = await supabase
          .from('dna_tree_structure')
          .select(`
            *,
            question:great_questions!dna_tree_structure_question_id_fkey (
              question,
              category_number,
              answer_a,
              answer_b
            )
          `)
          .eq('category', upperCategory)
          .eq('tree_position', currentPosition)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching question:', error);
          throw error;
        }
        
        if (!data) {
          console.error('No question found for:', { upperCategory, currentPosition });
          throw new Error('Question not found');
        }

        return data;
      } catch (error) {
        console.error(`Error fetching question for ${upperCategory}/${currentPosition}:`, error);
        throw error;
      }
    },
    enabled: !!upperCategory && !isTransitioning && !isInitializing,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 5000),
  });

  // Prefetch next questions
  useEffect(() => {
    const prefetchNextQuestions = async () => {
      if (!currentQuestion) return;

      const nextQuestionIds = [
        currentQuestion.next_question_a_id,
        currentQuestion.next_question_b_id
      ].filter(Boolean);

      for (const nextId of nextQuestionIds) {
        try {
          // Find the next question position first without triggering a full query
          const { data: nextQuestion } = await supabase
            .from('dna_tree_structure')
            .select('tree_position, category')
            .eq('id', nextId)
            .maybeSingle();

          if (nextQuestion) {
            // Then prefetch the full data
            await queryClient.prefetchQuery({
              queryKey: ['dna-question', nextQuestion.category, nextQuestion.tree_position],
              queryFn: async () => {
                const { data, error } = await supabase
                  .from('dna_tree_structure')
                  .select(`
                    *,
                    question:great_questions!dna_tree_structure_question_id_fkey (
                      question,
                      category_number,
                      answer_a,
                      answer_b
                    )
                  `)
                  .eq('category', nextQuestion.category)
                  .eq('tree_position', nextQuestion.tree_position)
                  .maybeSingle();

                if (error) throw error;
                return data;
              },
              staleTime: 5 * 60 * 1000,
            });
          }
        } catch (error) {
          console.error('Error prefetching next question:', error);
          // Don't block the UI for prefetch errors
        }
      }
    };

    if (currentQuestion) {
      prefetchNextQuestions();
    }
  }, [currentQuestion, queryClient]);

  // If the next category is available, prefetch its first question
  useEffect(() => {
    if (nextCategory && currentPosition === 'Q5') {
      queryClient.prefetchQuery({
        queryKey: ['dna-question', nextCategory, 'Q1'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('dna_tree_structure')
            .select(`
              *,
              question:great_questions!dna_tree_structure_question_id_fkey (
                question,
                category_number,
                answer_a,
                answer_b
              )
            `)
            .eq('category', nextCategory)
            .eq('tree_position', 'Q1')
            .maybeSingle();

          if (error) throw error;
          return data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [nextCategory, currentPosition, queryClient]);

  // Handle answer selection
  const handleAnswerSelection = (answer: "A" | "B") => {
    setSelectedAnswer(answer);
    
    if (showAIChat) {
      setShowAIChat(false);
    }
  };

  // Handle analysis initiation
  const initAnalysis = useCallback(async (answers: Record<string, string>, assessmentId: string) => {
    console.log('Starting DNA analysis...');

    try {
      const { error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: JSON.stringify(answers),
          assessment_id: assessmentId,
          profile_id: profileId
        }
      });

      if (error) {
        console.error('Error analyzing DNA results:', error);
        toast.error('Error analyzing results');
        throw error;
      }

      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error in DNA analysis:', error);
      toast.error('Error analyzing results');
    }
  }, [profileId]);

  // Handle continue button
  const handleContinue = async () => {
    if (!selectedAnswer || !currentQuestion || !assessmentId) return;
    
    try {
      setIsTransitioning(true);
      const answer = selectedAnswer;
      const newAnswers = answers + answer;
      setAnswers(newAnswers);
      
      const questionText = currentQuestion.question?.question || '';
      
      const answerLabel = answer === "A" 
        ? (currentQuestion.question?.answer_a || "Yes") 
        : (currentQuestion.question?.answer_b || "No");
      
      // Save conversation context
      conversationManager.addQuestionToPath(
        sessionStorage.getItem('dna_assessment_name') || 'Anonymous',
        currentPosition,
        questionText,
        answerLabel
      );
  
      const userId = sessionStorage.getItem('user_id');
      const sessionId = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      
      try {
        await conversationManager.saveConversationToSupabase(
          sessionId,
          assessmentId,
          userId,
          currentPosition
        );
      } catch (error) {
        console.error('Error saving conversation:', error);
        // Don't block progress for conversation errors
      }
  
      // Store question response
      const { error: responseError } = await supabase
        .from('dna_question_responses')
        .insert({
          assessment_id: assessmentId,
          category: upperCategory,
          question_id: currentQuestion.id,
          answer
        });
  
      if (responseError) {
        throw new Error(`Error storing question response: ${responseError.message}`);
      }
  
      const nextQuestionId = answer === "A" 
        ? currentQuestion.next_question_a_id 
        : currentQuestion.next_question_b_id;
  
      if (!nextQuestionId) {
        // End of this category
        try {
          const { data: currentData, error: fetchError } = await supabase
            .from('dna_assessment_results')
            .select('answers')
            .eq('id', assessmentId)
            .maybeSingle();
  
          if (fetchError) {
            throw new Error(`Error fetching current answers: ${fetchError.message}`);
          }
  
          const currentAnswers = (currentData?.answers as Record<string, string>) || {};
          const updatedAnswers = {
            ...currentAnswers,
            [upperCategory]: newAnswers
          };
  
          const sequenceColumnName = `${upperCategory.toLowerCase()}_sequence` as const;
          const updateData = {
            answers: updatedAnswers,
            [sequenceColumnName]: newAnswers
          };
  
          const { error: updateError } = await supabase
            .from('dna_assessment_results')
            .update(updateData)
            .eq('id', assessmentId);
  
          if (updateError) {
            throw new Error(`Error updating assessment results: ${updateError.message}`);
          }
  
          if (!nextCategory) {
            // Assessment complete
            setCompletedAssessmentId(assessmentId);
            localStorage.setItem('pending_dna_assessment_id', assessmentId);
            
            if (user) {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('outseta_user_id', user.Uid)
                  .maybeSingle();
                
                if (!profileError && profileData) {
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ assessment_id: assessmentId } as any)
                    .eq('id', profileData.id);
                  
                  if (!updateError) {
                    console.log('Successfully saved assessment ID to profile:', {
                      profileId: profileData.id,
                      assessmentId
                    });
                  }
                }
              } catch (error) {
                console.error('Error saving assessment ID to profile:', error);
              }
            }
  
            await initAnalysis(updatedAnswers, assessmentId);
            navigate('/dna/completion');
            return;
          } else {
            // Move to next category
            navigate(`/dna/${nextCategory.toLowerCase()}`);
            setCurrentPosition("Q1");
            setCurrentQuestionNumber(prev => prev + 1);
            setAnswers("");
            setSelectedAnswer(null);
          }
        } catch (error) {
          console.error('Error updating assessment:', error);
          toast.error('Error saving your progress');
          if (!nextCategory) {
            navigate('/dna');
          }
        }
      } else {
        // Move to next question in current category
        try {
          const { data: nextQuestion, error: nextQuestionError } = await supabase
            .from('dna_tree_structure')
            .select('tree_position')
            .eq('id', nextQuestionId)
            .maybeSingle();
  
          if (nextQuestionError || !nextQuestion) {
            throw new Error(`Error finding next question: ${nextQuestionError?.message || 'Next question not found'}`);
          }
  
          setCurrentPosition(nextQuestion.tree_position);
          setCurrentQuestionNumber(prev => prev + 1);
          setSelectedAnswer(null);
        } catch (error) {
          console.error('Error in question transition:', error);
          toast.error('Error loading next question');
        }
      }
    } catch (error) {
      console.error('Error handling answer submission:', error);
      toast.error('Error processing your answer');
    } finally {
      setIsTransitioning(false);
    }
  };

  // Handle exit button
  const handleExit = () => {
    setShowExitAlert(true);
  };

  // Confirm exit
  const confirmExit = () => {
    navigate('/dna');
    setShowExitAlert(false);
  };

  // Ensure user ID is set
  useEffect(() => {
    const ensureUserId = async () => {
      const existingUserId = sessionStorage.getItem('user_id');
      if (!existingUserId) {
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          } else if (userData && userData.user) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('outseta_user_id', userData.user.id)
                .maybeSingle();
                
              if (!profileError && profileData) {
                setProfileId(profileData.id);
                sessionStorage.setItem('user_id', profileData.id);
              } else {
                sessionStorage.setItem('user_id', userData.user.id);
              }
            } catch (error) {
              sessionStorage.setItem('user_id', userData.user.id);
            }
          } else {
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          }
        } catch (error) {
          const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('user_id', tempId);
        }
      } else if (!profileId && !existingUserId.startsWith('temp-')) {
        setProfileId(existingUserId);
      }
    };
    
    ensureUserId();
  }, [profileId]);

  // Add debugging tools
  useEffect(() => {
    (window as any).debugDNAConversation = () => {
      console.log('Debug info:');
      console.log('assessmentId (state):', assessmentId);
      console.log('assessmentId (sessionStorage):', sessionStorage.getItem('dna_assessment_id'));
      console.log('userId (sessionStorage):', sessionStorage.getItem('user_id'));
      console.log('sessionId (dna_assessment_name):', sessionStorage.getItem('dna_assessment_name'));
      console.log('currentPosition:', currentPosition);
      
      const sessionId = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      const conversation = conversationManager.getHistory(sessionId);
      const questionPath = conversationManager.getQuestionPath(sessionId);
      console.log('Conversation:', conversation);
      console.log('QuestionPath:', questionPath);
    };
    
    (window as any).manualSaveConversation = async () => {
      const sessionId = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      const assessmentIdToUse = assessmentId || sessionStorage.getItem('dna_assessment_id');
      const userIdToUse = sessionStorage.getItem('user_id') || 'temp-' + Math.random().toString(36).substring(2, 15);
      
      if (!assessmentIdToUse) {
        console.error('No assessment ID available for manual save');
        return;
      }
      
      try {
        await conversationManager.saveConversationToSupabase(
          sessionId,
          assessmentIdToUse,
          userIdToUse,
          currentPosition
        );
        console.log('Manual save completed');
      } catch (error) {
        console.error('Error in manual save:', error);
      }
    };
  }, [assessmentId, currentPosition]);

  const handleViewResults = () => {
    setShowLoginPrompt(false);
    navigate('/dna');
  }

  // Save assessment ID in local storage when login prompt is shown
  useEffect(() => {
    const saveAssessmentId = async () => {
      if (!showLoginPrompt) return;
      
      const assessmentId = completedAssessmentId || sessionStorage.getItem('dna_assessment_id');
      if (assessmentId) {
        localStorage.setItem('pending_dna_assessment_id', assessmentId);
        sessionStorage.setItem('dna_assessment_to_save', assessmentId);
        
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (!userError && userData?.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', userData.user.id)
              .maybeSingle();
            
            if (!profileError && profileData) {
              await supabase
                .from('profiles')
                .update({ assessment_id: assessmentId } as any)
                .eq('id', profileData.id);
            }
          }
        } catch (error) {
          console.error('Error saving assessment ID to profile:', error);
        }
      }
    };
    
    saveAssessmentId();
  }, [showLoginPrompt, completedAssessmentId, supabase]);

  const handleBookCounselor = () => {
    setShowExitAlert(false);
    navigate('/book-counselor');
  };

  // Enhanced loading state handling
  if ((questionLoading || isTransitioning || isInitializing) && !showLoginPrompt) {
    return (
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col">
        <header className="sticky top-0 px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
          <div className="h-10 w-10" />
          <div className="flex items-center gap-1 text-sm font-oxanium text-[#332E38]/25 uppercase tracking-wider font-bold">
            <span>{currentQuestionNumber}</span>
            <span>/</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </header>
        <div className="px-6">
          <Progress 
            value={progressPercentage}
            className="h-2 bg-[#373763]/30"
          />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="font-oxanium text-lg text-[#373763] flex flex-col items-center">
            {isInitializing ? 'Initializing assessment...' : 'Loading next question...'}
            <div className="mt-4 animate-spin h-6 w-6 border-2 border-[#373763]/50 border-t-[#373763] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle initialization errors
  if (initializationError) {
    return (
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col">
        <header className="sticky top-0 px-6 py-4 relative z-50 bg-[#E9E7E2]">
          <button 
            onClick={() => navigate('/dna')}
            className="text-[#332E38]/25 font-oxanium text-sm uppercase tracking-wider font-bold"
            type="button"
          >
            BACK
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="text-2xl font-libre-baskerville text-center mb-4">
            Error Initializing Assessment
          </h1>
          <p className="text-center mb-6">
            We encountered a problem starting your assessment. Please try again.
          </p>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-8 max-w-md w-full">
            <p className="text-sm text-red-800">
              Error details: {initializationError}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dna')}
            className="px-8 py-2 text-white bg-[#373763] hover:bg-[#373763]/90 transition-all duration-300 font-oxanium rounded-md"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  // Handle question not found
  if (!currentQuestion && !showLoginPrompt) {
    return (
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763]">
        <header className="sticky top-0 px-6 py-4 relative z-50 bg-[#E9E7E2]">
          <button 
            onClick={handleExit}
            className="text-[#332E38]/25 font-oxanium text-sm uppercase tracking-wider font-bold"
            type="button"
          >
            BACK
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] px-4">
          <h1 className="text-2xl font-oxanium text-center mb-8">
            Question not found
          </h1>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-8 py-2 text-white bg-[#373763] hover:bg-[#373763]/90 transition-all duration-300 font-oxanium rounded-md"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  const buttonTextA = currentQuestion?.question?.answer_a || "YES";
  const buttonTextB = currentQuestion?.question?.answer_b || "NO";

  return (
    <>
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col">
        <header className="sticky top-0 px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
          <button 
            onClick={handleExit}
            className="text-[#332E38]/25 font-oxanium text-sm uppercase tracking-wider font-bold"
            type="button"
          >
            BACK
          </button>
          <div className="flex items-center gap-1 text-sm font-oxanium text-[#332E38]/25 uppercase tracking-wider font-bold">
            <span>{currentQuestionNumber}</span>
            <span>/</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </header>
        <div className="px-6">
          <Progress 
            value={progressPercentage}
            className="h-2 bg-[#373763]/30"
          />
        </div>
        <div className="flex-1 flex flex-col relative h-[calc(100dvh-5rem)]">
          <div className={`flex-1 flex items-center justify-center py-8 transform transition-transform duration-300 ${showAIChat ? 'translate-y-[-25%]' : ''}`}>
            <h1 className="text-3xl md:text-4xl font-libre-baskerville font-bold text-center mx-auto max-w-md px-6 text-[#373763]">
              {currentQuestion?.question?.question}
            </h1>
          </div>
          <div className={`w-full px-6 mb-48 relative z-40 transform transition-transform duration-300 ${
            showAIChat ? 'translate-y-[calc(-40vh+10rem)]' : ''}`}>
            <div className="flex flex-row gap-4 max-w-md mx-auto w-full flex-wrap">
              <button
                onClick={() => handleAnswerSelection("A")}
                className={`flex-1 min-w-[120px] h-[52px] rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider whitespace-normal border border-[#373763]/20 ${
                  selectedAnswer === "A" 
                    ? "bg-[#332E38]/10 text-[#373763]" 
                    : "bg-[#E9E7E2] text-[#373763]"
                }`}
                type="button"
              >
                {buttonTextA}
              </button>
              <button
                onClick={() => handleAnswerSelection("B")}
                className={`flex-1 min-w-[120px] h-[52px] rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider whitespace-normal border border-[#373763]/20 ${
                  selectedAnswer === "B" 
                    ? "bg-[#332E38]/10 text-[#373763]" 
                    : "bg-[#E9E7E2] text-[#373763]"
                }`}
                type="button"
              >
                {buttonTextB}
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                className="font-oxanium text-[#332E38]/25 uppercase tracking-wider text-sm font-bold"
                onClick={() => setShowAIChat(true)}
              >
                I HAVE MORE TO SAY
              </button>
              
              <button 
                className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold ml-4 p-2 border border-dashed border-[#332E38]/30"
                onClick={() => navigate('/dna/completion')}
              >
                TEST COMPLETION SCREEN
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-md mx-auto mb-16
