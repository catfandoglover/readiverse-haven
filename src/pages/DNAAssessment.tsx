
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
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Check, LogIn, UserPlus } from "lucide-react";

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
  const [treeError, setTreeError] = React.useState<string | null>(null);
  const { user, openLogin, openSignup } = useAuth();
  const isMobile = useIsMobile();

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
          let userProfileId = null;
          
          const storedAssessmentId = sessionStorage.getItem('dna_assessment_id');
          if (storedAssessmentId) {
            console.log('Found stored assessment ID:', storedAssessmentId);
            setAssessmentId(storedAssessmentId);
            setIsInitializing(false);
            return;
          }
          
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

  const { data: currentQuestion, isLoading: questionLoading, error: questionError } = useQuery({
    queryKey: ['dna-question', upperCategory, currentPosition],
    queryFn: async () => {
      console.log('Fetching question for:', { upperCategory, currentPosition });
      
      if (!upperCategory) {
        throw new Error('Category is required');
      }

      // Special handling for problematic ETHICS AAA path
      if (upperCategory === 'ETHICS' && currentPosition === 'AAA') {
        console.log('Special handling for ETHICS AAA path');
        
        // First, try to retrieve the question data
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
            console.error('Error fetching ETHICS AAA question:', error);
            throw error;
          }
          
          if (!data) {
            console.error('No question found for ETHICS AAA');
            throw new Error('Critical path ETHICS AAA not found in tree structure');
          }
          
          // Check if next question references exist
          if (!data.next_question_a_id || !data.next_question_b_id) {
            console.error('Missing next question references in ETHICS AAA:', data);
            throw new Error('ETHICS AAA path is incomplete: missing next question references');
          }
          
          console.log('Successfully retrieved ETHICS AAA question:', data);
          return data;
        } catch (error) {
          console.error('Error in ETHICS AAA special handling:', error);
          setTreeError('The ethics assessment path is broken at position AAA. Please contact support.');
          throw error;
        }
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
    if (questionError) {
      console.error('Question query error:', questionError);
      
      // Check if it's the known ETHICS AAA issue
      if (upperCategory === 'ETHICS' && currentPosition === 'AAA') {
        toast.error('There is an issue with this question path. Redirecting to the next category.');
        
        // Log the error for debugging
        console.error('ETHICS AAA path error detected, attempting to recover');
        
        // Attempt to skip to the next category
        if (nextCategory) {
          navigate(`/dna/${nextCategory.toLowerCase()}`);
        } else {
          navigate('/dna');
        }
      }
    }
  }, [questionError, upperCategory, currentPosition, nextCategory, navigate]);

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

    if (showAIChat) {
      setShowAIChat(false);
    }

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

      // Special handling for known problematic path in ETHICS
      if (upperCategory === 'ETHICS' && currentPosition === 'AAA') {
        console.log('Special path handling for ETHICS AAA');
        
        try {
          // First try to verify the next question exists
          if (!nextQuestionId) {
            console.error('Missing next question ID for ETHICS AAA');
            throw new Error('Missing next question ID');
          }
          
          const { data: nextQuestionCheck, error: checkError } = await supabase
            .from('dna_tree_structure')
            .select('id, tree_position')
            .eq('id', nextQuestionId)
            .maybeSingle();
            
          if (checkError || !nextQuestionCheck) {
            console.error('Invalid next question reference in ETHICS AAA:', { nextQuestionId, error: checkError });
            throw new Error('Invalid next question reference');
          }
          
          console.log('Verified next question exists:', nextQuestionCheck);
        } catch (error) {
          console.error('Error during ETHICS AAA validation:', error);
          
          // Log this event
          console.log('Attempting to recover from ETHICS AAA path failure');
          toast.error('There was an issue with this question path. Moving to the next category.');
          
          // Skip to the next category
          if (nextCategory) {
            // Update the assessment with what we have so far for ETHICS
            try {
              const { data: currentData, error: fetchError } = await supabase
                .from('dna_assessment_results')
                .select('answers')
                .eq('id', assessmentId)
                .maybeSingle();

              if (!fetchError && currentData) {
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

                console.log('Updating assessment before skipping category:', updateData);
                await supabase
                  .from('dna_assessment_results')
                  .update(updateData)
                  .eq('id', assessmentId);
              }
            } catch (updateError) {
              console.error('Error updating assessment before skip:', updateError);
            }
            
            // Navigate to next category
            navigate(`/dna/${nextCategory.toLowerCase()}`);
            setCurrentPosition("Q1");
            setCurrentQuestionNumber(prev => prev + 1);
            setAnswers("");
            return;
          } else {
            // This was the last category, go to results
            navigate('/dna');
            return;
          }
        }
      }

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
            console.log('Assessment complete, showing login prompt...');
            
            setCompletedAssessmentId(assessmentId);
            
            localStorage.setItem('pending_dna_assessment_id', assessmentId);
            
            setIsTransitioning(false);
            
            setShowLoginPrompt(true);
            
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
          
          // Special handling if this happens in ETHICS category
          if (upperCategory === 'ETHICS') {
            console.error('Critical path error in ETHICS category');
            toast.error('There was an issue with the question path. Moving to next category.');
            
            if (nextCategory) {
              navigate(`/dna/${nextCategory.toLowerCase()}`);
              setCurrentPosition("Q1");
              setCurrentQuestionNumber(prev => prev + 1);
              setAnswers("");
            } else {
              navigate('/dna');
            }
            return;
          }
          
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
            const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('user_id', tempId);
          } else if (userData && userData.user) {
            console.log('Found authenticated user:', userData.user.id);
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', userData.user.id)
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
          console.error('Error in ensureUserId:', error);
          const tempId = 'temp-' + Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('user_id', tempId);
        }
      } else {
        console.log('Found existing user_id in sessionStorage:', existingUserId);
        if (!profileId && !existingUserId.startsWith('temp-')) {
          setProfileId(existingUserId);
        }
      }
    };
    
    ensureUserId();
  }, [profileId]);

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
    
    // Debug function specifically for ETHICS AAA path
    (window as any).debugEthicsPath = async () => {
      try {
        console.log('Debugging ETHICS AAA path...');
        
        const { data: ethicsData, error: ethicsError } = await supabase
          .from('dna_tree_structure')
          .select('id, tree_position, category, next_question_a_id, next_question_b_id, question_id')
          .eq('category', 'ETHICS')
          .eq('tree_position', 'AAA')
          .maybeSingle();
          
        console.log('ETHICS AAA node:', ethicsData);
        console.log('ETHICS AAA error:', ethicsError);
        
        if (ethicsData) {
          // Check next question links
          if (ethicsData.next_question_a_id) {
            const { data: nextA } = await supabase
              .from('dna_tree_structure')
              .select('id, tree_position')
              .eq('id', ethicsData.next_question_a_id)
              .maybeSingle();
              
            console.log('Next A exists:', nextA);
          } else {
            console.log('Next A link is missing');
          }
          
          if (ethicsData.next_question_b_id) {
            const { data: nextB } = await supabase
              .from('dna_tree_structure')
              .select('id, tree_position')
              .eq('id', ethicsData.next_question_b_id)
              .maybeSingle();
              
            console.log('Next B exists:', nextB);
          } else {
            console.log('Next B link is missing');
          }
        }
      } catch (error) {
        console.error('Error debugging ethics path:', error);
      }
    };
  }, [assessmentId, currentPosition]);

  const handleViewResults = () => {
    setShowLoginPrompt(false);
    navigate('/dna');
  }

  React.useEffect(() => {
    const saveAssessmentId = async () => {
      if (!showLoginPrompt) return;
      
      const assessmentId = completedAssessmentId || sessionStorage.getItem('dna_assessment_id');
      if (assessmentId) {
        localStorage.setItem('pending_dna_assessment_id', assessmentId);
        console.log('Saved assessment ID for login/signup:', assessmentId);
        
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
          }
        } catch (error) {
          console.error('Error saving assessment ID to profile:', error);
        }
      }
    };
    
    saveAssessmentId();
  }, [showLoginPrompt, completedAssessmentId, supabase]);

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
        <div className="flex-1 flex items-center justify-center">
          <div className="font-oxanium text-lg text-[#373763]">
            {isInitializing ? 'Initializing assessment...' : 'Loading next question...'}
          </div>
        </div>
      </div>
    );
  }

  if (treeError || (!currentQuestion && !showLoginPrompt)) {
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
            {treeError || "Question not found"}
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
            <h1 className="text-3xl md:text-4xl font-baskerville text-center mx-auto max-w-md px-6 text-[#373763]">
              {currentQuestion.question?.question}
            </h1>
          </div>
          <div className={`w-full px-6 mb-48 relative z-40 transform transition-transform duration-300 ${
            showAIChat ? 'translate-y-[calc(-40vh+10rem)]' : ''}`}>
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
                className="font-oxanium text-[#332E38]/25 uppercase tracking-wider text-sm font-bold"
                onClick={() => setShowAIChat(true)}
              >
                I HAVE MORE TO SAY
              </button>
              
              <button 
                className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold ml-4 p-2 border border-dashed border-[#332E38]/30"
                onClick={() => setShowLoginPrompt(true)}
              >
                TEST COMPLETION POPUP
              </button>
            </div>
          </div>
          
          {/* Added continue button with the same styling as priming screens */}
          <div className="w-full max-w-md mx-auto mb-16 px-6 absolute bottom-0 left-0 right-0">
            <Button 
              onClick={() => handleAnswer("A")}
              className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider dna-continue-button"
            >
              CONTINUE
            </Button>
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

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="bg-[#E9E7E2] max-w-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#373763]/10 p-3">
              <Check className="h-6 w-6 text-[#373763]" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="font-baskerville text-[#373763] text-center text-xl">
              Assessment Completed!
            </DialogTitle>
            <DialogDescription className="font-oxanium text-[#332E38] text-center text-base mt-2">
              To view your results please create an account or login.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <LoginButtons />
              </div>
              <Button 
                variant="ghost"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/dna');
                }}
                className="text-[#373763]/70 hover:text-[#373763] hover:bg-transparent font-oxanium text-sm font-bold uppercase tracking-wider"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

