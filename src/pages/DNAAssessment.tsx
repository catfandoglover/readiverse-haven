
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

  // Convert category to uppercase to match the enum type
  const upperCategory = category?.toUpperCase() as DNACategory;

  // Get the index of the current category and determine the next category
  const currentCategoryIndex = categoryOrder.findIndex(cat => cat === upperCategory);
  const nextCategory = currentCategoryIndex < categoryOrder.length - 1 
    ? categoryOrder[currentCategoryIndex + 1] 
    : null;

  // Calculate progress percentage
  const progressPercentage = (currentQuestionNumber / TOTAL_QUESTIONS) * 100;

  // Query for current question
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
    enabled: !!upperCategory && !isTransitioning,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Initialize or get assessment ID
  React.useEffect(() => {
    const initializeAssessment = async () => {
      if (!assessmentId && currentCategoryIndex === 0) {
        const name = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
        const { data, error } = await supabase
          .from('dna_assessment_results')
          .insert([{ name }])
          .select()
          .single();

        if (error) {
          console.error('Error creating assessment:', error);
          toast.error('Error starting assessment');
          return;
        }

        setAssessmentId(data.id);
        console.log('Created new assessment with ID:', data.id);
      }
    };

    initializeAssessment();
  }, [assessmentId, currentCategoryIndex]);

  // Prefetch next possible questions
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
            .single();

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

  // Store answer and handle navigation
  const handleAnswer = async (answer: "A" | "B") => {
    if (!currentQuestion || !assessmentId) return;

    const newAnswers = answers + answer;
    setAnswers(newAnswers);

    try {
      // Store individual question response
      console.log('Storing question response:', {
        assessment_id: assessmentId,
        category: upperCategory,
        question_id: currentQuestion.id,
        answer
      });

      const { data: responseData, error: responseError } = await supabase
        .from('dna_question_responses')
        .insert({
          assessment_id: assessmentId,
          category: upperCategory,
          question_id: currentQuestion.id,
          answer
        })
        .select();

      if (responseError) {
        console.error('Error storing question response:', responseError);
        toast.error('Error saving your answer');
        return;
      }

      console.log('Successfully stored question response:', responseData);

      const nextQuestionId = answer === "A" 
        ? currentQuestion.next_question_a_id 
        : currentQuestion.next_question_b_id;

      if (!nextQuestionId) {
        setIsTransitioning(true);

        // Get current answers from the assessment
        const { data: currentData, error: fetchError } = await supabase
          .from('dna_assessment_results')
          .select('answers')
          .eq('id', assessmentId)
          .single();

        if (fetchError) {
          console.error('Error fetching current answers:', fetchError);
          toast.error('Error updating results');
          return;
        }

        // Prepare the new answers object with type safety
        const currentAnswers = (currentData?.answers as Record<string, string>) || {};
        const updatedAnswers = {
          ...currentAnswers,
          [upperCategory]: newAnswers
        };

        // Create an update object with both the answers JSON and the specific sequence column
        const sequenceColumnName = `${upperCategory.toLowerCase()}_sequence`;
        const updateData: Record<string, any> = {
          answers: updatedAnswers,
          [sequenceColumnName]: newAnswers
        };

        console.log('Updating assessment with:', updateData);

        // Update assessment results
        const { error: updateError } = await supabase
          .from('dna_assessment_results')
          .update(updateData)
          .eq('id', assessmentId);

        if (updateError) {
          console.error('Error updating assessment results:', updateError);
          toast.error('Error saving category results');
          return;
        }

        if (currentCategoryIndex < categoryOrder.length - 1) {
          const nextCategory = categoryOrder[currentCategoryIndex + 1];
          
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
          setIsTransitioning(false);
          return;
        }
        
        navigate('/dna');
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

  if (questionLoading || isTransitioning) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="px-4 py-3 flex items-center justify-between relative z-50">
          <div className="h-10 w-10" />
          <div className="flex items-center gap-1 text-sm font-oxanium text-foreground mr-3">
            <span>{currentQuestionNumber}</span>
            <span>/</span>
            <span>{TOTAL_QUESTIONS}</span>
          </div>
        </header>
        <div className="px-4">
          <Progress 
            value={progressPercentage}
            className="bg-secondary/10"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="font-oxanium text-lg">Loading next question...</div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="px-4 py-3 relative z-50">
          <button 
            onClick={handleExit}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <h1 className="text-2xl font-oxanium text-center mb-8">
            Question not found
          </h1>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-8 py-2 text-foreground bg-background hover:bg-accent transition-colors duration-300 font-oxanium"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  const buttonTextA = currentQuestion.question?.answer_a || "Yes";
  const buttonTextB = currentQuestion.question?.answer_b || "No";

  const buttonStyles = "text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between relative z-50">
        <button 
          onClick={handleExit}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 text-sm font-oxanium text-foreground mr-3">
          <span>{currentQuestionNumber}</span>
          <span>/</span>
          <span>{TOTAL_QUESTIONS}</span>
        </div>
      </header>
      <div className="px-4">
        <Progress 
          value={progressPercentage}
          className="bg-secondary/10"
        />
      </div>
      <div className="flex-1 flex flex-col px-4 relative">
        <div className="flex-1 flex items-center justify-center min-h-[200px] py-8 mb-20 translate-y-[-25%]">
          <h1 className="text-3xl font-baskerville text-center max-w-2xl">
            {currentQuestion.question?.question}
          </h1>
        </div>
        <div className="flex justify-center gap-4 w-full max-w-lg mx-auto absolute left-1/2 top-1/2 -translate-x-1/2">
          <Button
            variant="outline"
            className={`${buttonStyles} w-40`}
            onClick={() => handleAnswer("A")}
          >
            {buttonTextA}
          </Button>
          <Button
            variant="outline"
            className={`${buttonStyles} w-40`}
            onClick={() => handleAnswer("B")}
          >
            {buttonTextB}
          </Button>
        </div>
      </div>

      <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-oxanium">Are you sure you want to exit?</AlertDialogTitle>
            <AlertDialogDescription className="font-oxanium">
              Your progress will not be saved and you will need to retake the assessment from the beginning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExit}
              className="text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
            >
              Exit Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DNAAssessment;
