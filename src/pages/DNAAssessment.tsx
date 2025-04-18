import React from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import AIChatButton from '@/components/survey/AIChatButton';
import AIChatDialog from '@/components/survey/AIChatDialog';
import conversationManager from '@/services/ConversationManager';
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Check, LogIn, UserPlus, X } from "lucide-react";
import { storeAssessmentId } from '@/utils/dnaAssessmentUtils';

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
  const [currentPosition, setCurrentPosition] = React.useState("Q1");
  const [currentQuestionNumber, setCurrentQuestionNumber] = React.useState(1);
  const [showExitAlert, setShowExitAlert] = React.useState(false);
  const [answers, setAnswers] = React.useState<string>("");
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [assessmentId, setAssessmentId] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showAIChat, setShowAIChat] = React.useState(false);
  const [aiEnabled, setAIEnabled] = React.useState(true);
  const [profileId, setProfileId] = React.useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);
  const [completedAssessmentId, setCompletedAssessmentId] = React.useState<string | null>(null);
  const { user, openLogin, openSignup } = useAuth();
  const isMobile = useIsMobile();
  const [selectedAnswer, setSelectedAnswer] = React.useState<"A" | "B" | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = React.useState(false);

  // Utility function to safely check if a user is logged in
  const safeRedirectToCompletionScreen = () => {
    try {
      // Try to get the current user, but handle potential errors
      supabase.auth.getUser()
        .then(({ data, error }) => {
          if (error || !data.user) {
            console.log('No authenticated user detected, redirecting to completion screen');
            navigate('/dna/completion', { replace: true });
          } else {
            console.log('Authenticated user detected, redirecting to welcome screen');
            navigate('/dna/welcome', { replace: true });
          }
        })
        .catch(error => {
          console.log('Error checking auth state, defaulting to completion screen:', error);
          navigate('/dna/completion', { replace: true });
        });
    } catch (error) {
      console.log('Exception in redirect check, defaulting to completion screen:', error);
      navigate('/dna/completion', { replace: true });
    }
  };

  const initAnalysis = async (answers: Record<string, string>, assessmentId: string) => {
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
      setIsAssessmentComplete(true);
    } catch (error) {
      console.error('Error in DNA analysis:', error);
      toast.error('Error analyzing results');
      setIsAssessmentComplete(true); // Still mark as complete so user can proceed
    }
  };

  const upperCategory = category?.toUpperCase() as DNACategory;

  const currentCategoryIndex = categoryOrder.findIndex(cat => cat === upperCategory);
  const nextCategory = currentCategoryIndex < categoryOrder.length - 1 
    ? categoryOrder[currentCategoryIndex + 1] 
    : null;

  const progressPercentage = (currentQuestionNumber / TOTAL_QUESTIONS) * 100;

  React.useEffect(() => {
    const initializeAssessment = async () => {
      if (!assessmentId && currentCategoryIndex === 0) {
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
          
          let userData = null;
          let userError = null;
          
          try {
            // This call can throw AuthSessionMissingError
            const authResult = await supabase.auth.getUser();
            userData = authResult.data;
            userError = authResult.error;
          } catch (authError) {
            console.log('Auth error caught during initialization:', authError);
            userError = authError;
          }
          
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
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', userData.user.id)
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
          } else {
            console.log('No authenticated user, using temporary ID');
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          }
          
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
            console.error('Error creating assessment:', createError);
            toast.error('Error starting assessment');
            return;
          }

          if (!newAssessment) {
            console.error('No assessment created');
            toast.error('Error creating assessment');
            return;
          }

          setAssessmentId(newAssessment.id);
          console.log('Created new assessment with ID:', newAssessment.id);
          sessionStorage.setItem('dna_assessment_id', newAssessment.id);
          
          const { data: verifyData, error: verifyError } = await supabase
            .from('dna_assessment_results')
            .select('*')
            .eq('id', newAssessment.id)
            .maybeSingle();

          if (verifyError || !verifyData) {
            console.error('Error verifying assessment:', verifyError);
            toast.error('Error verifying assessment');
            return;
          }

          console.log('Verified assessment exists:', verifyData);
        } catch (error) {
          console.error('Error in assessment initialization:', error);
          toast.error('Error initializing assessment');
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    initializeAssessment();
  }, [assessmentId, currentCategoryIndex]);

  const { data: currentQuestion, isLoading: questionLoading } = useQuery({
    queryKey: ['dna-question', upperCategory, currentPosition],
    queryFn: async () => {
      console.log('Fetching question for:', { upperCategory, currentPosition });
      
      if (!upperCategory) {
        throw new Error('Category is required');
      }

      // Safety check to prevent trying to load Q31 and beyond
      if (currentPosition === 'Q31' || currentQuestionNumber > TOTAL_QUESTIONS) {
        console.log('Attempted to load question beyond limit:', currentPosition);
        // Redirect to completion or welcome based on user status
        if (!user) {
          navigate('/dna/completion', { replace: true });
        } else {
          navigate('/dna/welcome', { replace: true });
        }
        throw new Error('Question beyond limit');
      }

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

      console.log('Found question:', data);
      return data;
    },
    enabled: !!upperCategory && !isTransitioning && !isInitializing,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  React.useEffect(() => {
    const prefetchNextQuestions = async () => {
      if (!currentQuestion) return;

      console.log('Starting to prefetch next possible questions');

      const nextQuestionIds = [
        currentQuestion.next_question_a_id,
        currentQuestion.next_question_b_id
      ].filter(Boolean);

      for (const nextId of nextQuestionIds) {
        try {
          const { data: nextQuestion } = await supabase
            .from('dna_tree_structure')
            .select('tree_position, category')
            .eq('id', nextId)
            .maybeSingle();

          if (nextQuestion) {
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
                console.log(`Prefetched question: ${nextQuestion.category} - ${nextQuestion.tree_position}`);
                return data;
              },
              staleTime: 5 * 60 * 1000,
            });
          }
        } catch (error) {
          console.error('Error prefetching next question:', error);
        }
      }
    };

    prefetchNextQuestions();
  }, [currentQuestion, queryClient]);

  const handleAnswerSelection = (answer: "A" | "B") => {
    setSelectedAnswer(answer);
    
    if (showAIChat) {
      setShowAIChat(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedAnswer || !currentQuestion || !assessmentId) return;
    
    const answer = selectedAnswer;
    const newAnswers = answers + answer;
    setAnswers(newAnswers);
    
    const questionText = currentQuestion.question?.question || '';
    
    const answerLabel = answer === "A" 
      ? (currentQuestion.question?.answer_a || "Yes") 
      : (currentQuestion.question?.answer_b || "No");
    
    conversationManager.addQuestionToPath(
      sessionStorage.getItem('dna_assessment_name') || 'Anonymous',
      currentPosition,
      questionText,
      answerLabel
    );

    const userId = sessionStorage.getItem('user_id');
    const sessionId = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
    
    console.log('Preparing to save conversation:', {
      sessionId,
      assessmentId,
      userId,
      currentPosition
    });
    
    try {
      await conversationManager.saveConversationToSupabase(
        sessionId,
        assessmentId,
        userId,
        currentPosition
      );
    } catch (error) {
      console.error('Error in saveConversationToSupabase:', error);
    }

    try {
      console.log('Storing question response:', {
        assessment_id: assessmentId,
        category: upperCategory,
        question_id: currentQuestion.id,
        answer
      });

      const { error: responseError } = await supabase
        .from('dna_question_responses')
        .insert({
          assessment_id: assessmentId,
          category: upperCategory,
          question_id: currentQuestion.id,
          answer
        });

      if (responseError) {
        console.error('Error storing question response:', responseError);
        toast.error('Error saving your answer');
        return;
      }

      const nextQuestionId = answer === "A" 
        ? currentQuestion.next_question_a_id 
        : currentQuestion.next_question_b_id;

      if (!nextQuestionId) {
        setIsTransitioning(true);

        try {
          const { data: currentData, error: fetchError } = await supabase
            .from('dna_assessment_results')
            .select('answers')
            .eq('id', assessmentId)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching current answers:', fetchError);
            toast.error('Error updating results');
            return;
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

          console.log('Updating assessment with:', updateData);

          const { error: updateError } = await supabase
            .from('dna_assessment_results')
            .update(updateData)
            .eq('id', assessmentId);

          if (updateError) {
            console.error('Error updating assessment results:', updateError);
            toast.error('Error saving category results');
            return;
          }

          // Add detailed logging for debugging
          console.log('Category completion check:', {
            currentCategory: upperCategory,
            isAesthetics: upperCategory === "AESTHETICS",
            hasNextCategory: !!nextCategory,
            nextCategory,
            currentCategoryIndex,
            totalCategories: categoryOrder.length,
            questionNumber: currentQuestionNumber,
            isLastQuestion: currentQuestionNumber === TOTAL_QUESTIONS
          });

          // Check if this is the last category (AESTHETICS) or we've reached the final question
          if (upperCategory === "AESTHETICS" || !nextCategory || currentQuestionNumber === TOTAL_QUESTIONS) {
            console.log('Assessment complete, finishing assessment...');
            
            setCompletedAssessmentId(assessmentId);
            storeAssessmentId(assessmentId);
            
            // Force immediate redirect after 50ms regardless of analysis
            setTimeout(() => {
              safeRedirectToCompletionScreen();
            }, 50);
            
            await initAnalysis(updatedAnswers, assessmentId);
            
            // Force navigation to completion for anonymous users or welcome for logged-in users
            safeRedirectToCompletionScreen();
            
            if (user) {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (!profileError && profileData) {
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ 
                      assessment_id: assessmentId 
                    } as any)
                    .eq('id', profileData.id);
                  
                  if (updateError) {
                    console.error('Error updating profile with assessment ID:', updateError);
                  } else {
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
            
            setIsTransitioning(false);
            return;
          } else {
            await queryClient.prefetchQuery({
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
            });

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
        } finally {
          setIsTransitioning(false);
        }
        return;
      }

      try {
        const { data: nextQuestion, error: nextQuestionError } = await supabase
          .from('dna_tree_structure')
          .select('tree_position')
          .eq('id', nextQuestionId)
          .maybeSingle();

        if (nextQuestionError) {
          console.error('Error fetching next question:', nextQuestionError);
          return;
        }

        if (!nextQuestion) {
          console.error('Next question not found for ID:', nextQuestionId);
          return;
        }

        // If we're about to exceed the total questions limit, redirect instead of loading next question
        const nextQuestionNumber = currentQuestionNumber + 1;
        if (nextQuestionNumber > TOTAL_QUESTIONS) {
          console.log(`Reached question limit (${TOTAL_QUESTIONS}), redirecting...`);
          
          // Redirect based on user status with replace:true to prevent back navigation
          if (!user) {
            navigate('/dna/completion', { replace: true });
          } else {
            navigate('/dna/welcome', { replace: true });
          }
          return;
        }

        setCurrentPosition(nextQuestion.tree_position);
        setCurrentQuestionNumber(prev => prev + 1);
        setSelectedAnswer(null);
      } catch (error) {
        console.error('Error in question transition:', error);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      toast.error('Error processing your answer');
    }
  };

  const handleExit = () => {
    setShowExitAlert(true);
  };

  const confirmExit = () => {
    navigate('/dna');
    setShowExitAlert(false);
  };

  const handleBookCounselor = () => {
    setShowExitAlert(false);
    navigate('/book-counselor');
  };

  React.useEffect(() => {
    const ensureUserId = async () => {
      const existingUserId = sessionStorage.getItem('user_id');
      if (!existingUserId) {
        console.log('No user_id found in sessionStorage, attempting to set it');
        
        try {
          let userData = null;
          let userError = null;
          
          try {
            // This call can throw AuthSessionMissingError
            const authResult = await supabase.auth.getUser();
            userData = authResult.data;
            userError = authResult.error;
          } catch (authError) {
            console.log('Auth error caught:', authError);
            userError = authError;
          }
          
          if (userError) {
            console.log('User is not authenticated, using anonymous ID');
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          } else if (userData && userData.user) {
            console.log('Found authenticated user:', userData.user.id);
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', userData.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Error getting profile:', profileError);
              sessionStorage.setItem('user_id', userData.user.id);
            } else if (profileData) {
              console.log('Found profile, setting user_id to profile.id:', profileData.id);
              setProfileId(profileData.id);
              sessionStorage.setItem('user_id', profileData.id);
            } else {
              console.log('No profile found, setting user_id to auth.user.id:', userData.user.id);
              sessionStorage.setItem('user_id', userData.user.id);
            }
          } else {
            console.log('No authenticated user, using temporary ID');
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          }
        } catch (error) {
          console.error('Error setting user_id:', error);
          const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('user_id', tempId);
        }
      } else {
        console.log('Using existing user_id from sessionStorage:', existingUserId);
        setProfileId(existingUserId);
      }
    };

    ensureUserId();
  }, []);

  React.useEffect(() => {
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
      
      console.log('Manual save with:', {
        sessionId,
        assessmentId: assessmentIdToUse,
        userId: userIdToUse,
        questionId: currentPosition
      });
      
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

  const handleTestCompletionClick = () => {
    const currentAssessmentId = assessmentId || sessionStorage.getItem('dna_assessment_id');

    if (!currentAssessmentId) {
      console.error("TEST BUTTON ERROR: No assessmentId available (state or sessionStorage) to mark as complete.");
      toast.error("Error: Cannot simulate completion without an active assessment ID.");
      return;
    }

    console.log(`TEST BUTTON: Simulating completion for assessment ID: ${currentAssessmentId}`);

    // Set the completedAssessmentId state
    setCompletedAssessmentId(currentAssessmentId);
    console.log(`TEST BUTTON: Set completedAssessmentId state to: ${currentAssessmentId}`);

    // Check if the user is currently anonymous
    if (!user) {
      // If anonymous, set showLoginPrompt to true
      setShowLoginPrompt(true);
      console.log("TEST BUTTON: User is anonymous. Setting showLoginPrompt state to true.");

      // Use the new storage utility instead of manually setting in multiple places
      storeAssessmentId(currentAssessmentId);
      console.log("TEST BUTTON: Saved assessment ID to all storage mechanisms.");

      // Navigate to the completion screen
      console.log("TEST BUTTON: Navigating to /dna/completion to show login/signup prompt.");
      navigate('/dna/completion');

      toast.info("Simulated anonymous completion. Navigating to completion screen.");

    } else {
      console.log("TEST BUTTON: User is already logged in. Not setting showLoginPrompt.");
      toast.warning("Simulating completion for logged-in user. This test focuses on the anonymous flow.");
       // Optionally navigate logged-in users elsewhere if needed for testing
       // navigate('/dna/welcome');
    }
  };

  if ((questionLoading || isTransitioning || isInitializing) && !showLoginPrompt) {
    // Add immediate redirection when we've reached the end (question 30/AESTHETICS category)
    if (currentQuestionNumber > TOTAL_QUESTIONS) {
      console.log('End of assessment detected during loading state - redirecting...');
      
      // Force immediate redirection with 50ms timeout
      setTimeout(() => {
        safeRedirectToCompletionScreen();
      }, 50);
      
      // Force immediate redirection based on user status with replace:true
      safeRedirectToCompletionScreen();
      
      return null; // Return null to prevent rendering while redirecting
    }
    
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
        <div className="flex-1 flex items-center justify-center">
          <div className="font-oxanium text-lg text-[#373763]">
            {isInitializing ? 'Initializing assessment...' : 'Loading next question...'}
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col justify-between">
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
        <div className="flex-1 flex flex-col relative">
          <div className={`flex items-center justify-center py-8 min-h-[40vh] max-h-[40vh] transform transition-transform duration-300 ${
            showAIChat ? 'translate-y-[-10%]' : ''}`}>
            <h1 className="text-3xl md:text-4xl font-libre-baskerville font-bold text-center mx-auto max-w-md px-6 text-[#373763]">
              {currentQuestion?.question?.question}
            </h1>
          </div>
          <div className={`w-full px-6 absolute top-[40vh] z-40 transform transition-transform duration-300 ${
            showAIChat ? 'translate-y-[calc(-8vh)]' : ''}`}>
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
            
            <div className={`mt-8 text-center absolute w-full left-0 px-6 transition-transform ${
              showAIChat ? 'transform translate-y-[calc(35vh-100px)]' : ''
            }`}>
              <button 
                className="font-oxanium text-[#332E38]/25 uppercase tracking-wider text-sm font-bold"
                onClick={() => setShowAIChat(true)}
              >
                I HAVE MORE TO SAY
              </button>
              
              {/* Development/Testing Buttons */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <button
                    onClick={handleTestCompletionClick}
                    className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold ml-4 p-2 border border-dashed border-[#332E38]/30"
                  >
                    Simulate Anonymous Finish & Go To Completion Screen
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-md mx-auto mb-16 px-6">
          <Button 
            onClick={handleContinue}
            disabled={selectedAnswer === null}
            className={`w-full py-6 rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider border transition-colors duration-200 ${
              selectedAnswer !== null 
                ? "bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 border-[#373763]" 
                : "bg-[#E9E7E2] text-[#373763] border-[#373763]/20 cursor-not-allowed"
            }`}
          >
            CONTINUE
          </Button>
        </div>

        <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
          <AlertDialogContent className="bg-[#E9E7E2]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-libre-baskerville font-bold">Need some help?</AlertDialogTitle>
              <AlertDialogDescription className="font-oxanium">
                These questions explore deep and complex ideas—it's natural to find them challenging. If you'd like to pause, you can either restart the assessment later or book a session with one of our intellectual genetic counselors for personalized guidance.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogAction 
                className="bg-[#373763] text-white font-oxanium"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default to keep dialog open
                  handleBookCounselor();
                }}
              >
                BOOK A COUNSELOR
              </AlertDialogAction>
              <AlertDialogCancel 
                onClick={confirmExit}
                className="bg-[#E9E7E2]/50 text-[#373763] border border-[#373763]/20"
              >
                EXIT ASSESSMENT
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </div>

      <AIChatDialog 
        open={showAIChat}
        onOpenChange={setShowAIChat}
        sessionId={sessionStorage.getItem('dna_assessment_name') || 'Anonymous'}
        currentQuestion={currentQuestion?.question?.question || ''}
      />
    </>
  );
};

export default DNAAssessment;
