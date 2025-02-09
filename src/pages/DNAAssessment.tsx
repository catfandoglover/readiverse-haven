
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type DNACategory = Database["public"]["Enums"]["dna_category"];

const DNAAssessment = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPosition, setCurrentPosition] = React.useState("Q1");

  // Convert category to uppercase to match the enum type
  const upperCategory = category?.toUpperCase() as DNACategory;

  // Hardcoded user ID for testing
  const mockUserId = "3157cbda-131b-449e-954e-1ad658739f39";

  const { data: currentQuestion, isLoading: questionLoading, error } = useQuery({
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
            category_number
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
    retry: false
  });

  const handleAnswer = async (answer: "A" | "B") => {
    if (!currentQuestion) return;

    // Get the next question ID based on the selected answer
    const nextQuestionId = answer === "A" 
      ? currentQuestion.next_question_a_id 
      : currentQuestion.next_question_b_id;

    // If there's no next question, the assessment is complete
    if (!nextQuestionId) {
      try {
        // Save progress and navigate back
        const { error: saveError } = await supabase
          .from('dna_assessment_progress')
          .upsert({
            user_id: mockUserId,
            category: upperCategory,
            completed: true,
            current_position: currentPosition,
            responses: {} // You might want to store the responses here
          });

        if (saveError) {
          console.error('Error saving progress:', saveError);
          toast({
            variant: "destructive",
            title: "Error saving progress",
            description: "Please try again"
          });
          return;
        }

        navigate('/dna');
      } catch (error) {
        console.error('Error in completion flow:', error);
        toast({
          variant: "destructive",
          title: "Error completing assessment",
          description: "Please try again"
        });
      }
      return;
    }

    try {
      // Get the tree position for the next question
      const { data: nextQuestion, error: nextQuestionError } = await supabase
        .from('dna_tree_structure')
        .select('tree_position')
        .eq('id', nextQuestionId)
        .maybeSingle();

      if (nextQuestionError) {
        console.error('Error fetching next question:', nextQuestionError);
        toast({
          variant: "destructive",
          title: "Error fetching next question",
          description: "Please try again"
        });
        return;
      }

      if (!nextQuestion) {
        console.error('Next question not found for ID:', nextQuestionId);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Next question not found"
        });
        return;
      }

      // Update the current position
      setCurrentPosition(nextQuestion.tree_position);
    } catch (error) {
      console.error('Error in question transition:', error);
      toast({
        variant: "destructive",
        title: "Error loading next question",
        description: "Please try again"
      });
    }
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-[#32303c] text-[#E9E7E2] flex items-center justify-center">
        <div className="font-oxanium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#32303c] text-[#E9E7E2]">
        <header className="px-4 py-3">
          <button 
            onClick={() => navigate('/dna')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <h1 className="text-2xl font-oxanium text-center mb-8">
            No questions found for this category
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate('/dna')}
            className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#32303c] text-[#E9E7E2]">
        <header className="px-4 py-3">
          <button 
            onClick={() => navigate('/dna')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
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
            onClick={() => navigate('/dna')}
            className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#32303c] text-[#E9E7E2]">
      <header className="px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dna')}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 text-sm font-oxanium text-[#E9E7E2] mr-3">
          <span>{currentPosition?.split('Q')[1]}</span>
          <span>/</span>
          <span>30</span>
        </div>
      </header>
      <div className="px-4">
        <Progress 
          value={(Number(currentPosition?.split('Q')[1]) / 30) * 100}
          className="bg-[#CCFF23]/10"
        />
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 py-8">
        <h1 className="text-3xl font-oxanium text-center mb-16 max-w-2xl">
          {currentQuestion.question?.question}
        </h1>
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Button
            variant="outline"
            className="w-full py-6 text-lg font-oxanium bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
            onClick={() => handleAnswer("A")}
          >
            YES
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 text-lg font-oxanium bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
            onClick={() => handleAnswer("B")}
          >
            NO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DNAAssessment;

