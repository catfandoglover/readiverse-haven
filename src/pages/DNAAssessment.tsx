import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import AIChatButton from '@/components/survey/AIChatButton';
import AIChatDialog from '@/components/survey/AIChatDialog';
import conversationManager from '@/services/ConversationManager';

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

  const initAnalysis = async (answers: Record<string, string>, assessmentId: string) => {
    console.log('Starting DNA analysis...');

    try {
      const { error } = await supabase.functions.invoke('analyze-dna', {
        body: {
          answers_json: JSON.stringify(answers),
          assessment_id: assessmentId,
          profile_image_url: null
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
          
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user:', userError);
          } else if (userData && userData.user) {
            console.log('Current user:', userData.user);
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', userData.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Error getting profile:', profileError);
            } else if (profileData) {
              console.log('Found profile:', profileData);
              sessionStorage.setItem('user_id', profileData.id);
            } else {
              console.log('No profile found, using auth user ID');
              sessionStorage.setItem('user_id', userData.user.id);
            }
          } else {
            console.log('No authenticated user, using temporary ID');
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          }
          
          const { data: newAssessment, error: createError } = await supabase
            .from('dna_assessment_results')
            .insert([{ 
              name,
              answers: {},
              ethics_sequence: '',
              epistemology_sequence: '',
              politics_sequence: '',
              theology_sequence: '',
              ontology_sequence: '',
              aesthetics_sequence: ''
            }])
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

  const handleAnswer = async (answer: "A" | "B") => {
    if (!currentQuestion || !assessmentId) return;

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

          if (!nextCategory) {
            console.log('Assessment complete, navigating to results...');
            
            navigate('/dna');
            
            toast.success('Assessment completed! View your results below', {
              duration: 3000
            });

            await initAnalysis(updatedAnswers, assessmentId);
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

        setCurrentPosition(nextQuestion.tree_position);
        setCurrentQuestionNumber(prev => prev + 1);
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

  React.useEffect(() => {
    const ensureUserId = async () => {
      const existingUserId = sessionStorage.getItem('user_id');
      if (!existingUserId) {
        console.log('No user_id found in sessionStorage, attempting to set it');
        
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.log('User is not authenticated, using anonymous ID');
          } else if (userData && userData.user) {
            console.log('Found authenticated user:', userData.user.id);
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', userData.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Error getting profile:', profileError);
            } else if (profileData) {
              console.log('Found profile, setting user_id to profile.id:', profileData.id);
              sessionStorage.setItem('user_id', profileData.id);
            } else {
              console.log('No profile found, setting user_id to auth.user.id:', userData.user.id);
              sessionStorage.setItem('user_id', userData.user.id);
            }
          }
        } catch (error) {
          console.error('Error in ensureUserId:', error);
        }
      } else {
        console.log('Found existing user_id in sessionStorage:', existingUserId);
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

  if (questionLoading || isTransitioning || isInitializing) {
    return (
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col">
        <header className="sticky top-0 px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
          <div className="h-10 w-10" />
          <div className="flex items-center gap-1 text-sm font-oxanium text-[#7A798A] uppercase tracking-wider font-bold">
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

  if (!currentQuestion) {
    return (
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763]">
        <header className="sticky top-0 px-6 py-4 relative z-50 bg-[#E9E7E2]">
          <button 
            onClick={handleExit}
            className="text-[#282828] font-oxanium text-sm uppercase tracking-wider font-bold"
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

  const buttonTextA = currentQuestion.question?.answer_a || "YES";
  const buttonTextB = currentQuestion.question?.answer_b || "NO";

  return (
    <>
      <div className="min-h-[100dvh] bg-[#E9E7E2] text-[#373763] flex flex-col">
        <header className="sticky top-0 px-6 py-4 flex items-center justify-between relative z-50 bg-[#E9E7E2]">
          <button 
            onClick={handleExit}
            className="text-[#282828] font-oxanium text-sm uppercase tracking-wider font-bold"
            type="button"
          >
            BACK
          </button>
          <div className="flex items-center gap-1 text-sm font-oxanium text-[#282828] uppercase tracking-wider font-bold">
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
          <div className="flex-1 flex items-center justify-center py-8">
            <h1 className="text-3xl md:text-4xl font-baskerville text-center mx-auto max-w-md px-6 text-[#373763]">
              {currentQuestion.question?.question}
            </h1>
          </div>
          <div className="w-full px-6 mb-48">
            <div className="flex flex-row gap-4 max-w-md mx-auto w-full">
              <Button
                onClick={() => handleAnswer("A")}
                className="flex-1 py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
              >
                {buttonTextA}
              </Button>
              <Button
                onClick={() => handleAnswer("B")}
                className="flex-1 py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
              >
                {buttonTextB}
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold"
                onClick={() => setShowAIChat(true)}
              >
                I HAVE MORE TO SAY
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <div className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold">
              LIGHTNING
            </div>
          </div>
        </div>

        <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
          <AlertDialogContent className="bg-[#E9E7E2]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-oxanium">Are you sure you want to exit?</AlertDialogTitle>
              <AlertDialogDescription className="font-oxanium">
                Your progress will not be saved and you will need to retake the assessment from the beginning.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#E9E7E2] border border-[#373763] text-[#373763] font-oxanium">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmExit}
                className="bg-[#373763] text-white font-oxanium"
              >
                Exit Assessment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AIChatDialog 
        open={showAIChat}
        onOpenChange={setShowAIChat}
        sessionId={sessionStorage.getItem('dna_assessment_name') || 'Anonymous'}
        currentQuestion={currentQuestion.question?.question || ''}
      />
    </>
  );
};

export default DNAAssessment;
