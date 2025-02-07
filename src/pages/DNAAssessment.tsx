
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";

type DNACategory = Database["public"]["Enums"]["dna_category"];

const DNAAssessment = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = React.useState<"A" | "B" | null>(null);
  const [currentPosition, setCurrentPosition] = React.useState("Q1");

  const { data: currentQuestion, isLoading, error } = useQuery({
    queryKey: ['dna-question', category, currentPosition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dna_tree_structure')
        .select(`
          *,
          question: great_questions!dna_tree_structure_question_id_fkey (
            question,
            category_number
          )
        `)
        .eq('category', category?.toUpperCase() as DNACategory)
        .eq('tree_position', currentPosition)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Question not found');
      return data;
    },
  });

  const handleAnswer = (answer: "A" | "B") => {
    setSelectedAnswer(answer);
  };

  const handleContinue = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      navigate('/auth');
      return;
    }

    // Get the next question ID based on the selected answer
    const nextQuestionId = selectedAnswer === "A" 
      ? currentQuestion.next_question_a_id 
      : currentQuestion.next_question_b_id;

    // If there's no next question, the assessment is complete
    if (!nextQuestionId) {
      // Save progress and navigate back
      const { error } = await supabase
        .from('dna_assessment_progress')
        .upsert({
          user_id: user.id,
          category: category?.toUpperCase() as DNACategory,
          completed: true,
          current_position: currentPosition,
          responses: {} // You might want to store the responses here
        });

      if (error) {
        console.error('Error saving progress:', error);
      }

      navigate('/dna');
      return;
    }

    // Get the tree position for the next question
    const { data: nextQuestion, error } = await supabase
      .from('dna_tree_structure')
      .select('tree_position')
      .eq('id', nextQuestionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching next question:', error);
      return;
    }

    if (!nextQuestion) {
      console.error('Next question not found');
      return;
    }

    // Update the current position and reset the selected answer
    setCurrentPosition(nextQuestion.tree_position);
    setSelectedAnswer(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-white">
        <header className="px-4 py-3">
          <button 
            onClick={() => navigate('/dna')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <h1 className="text-2xl font-serif text-center mb-8">
            Question not found
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate('/dna')}
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dna')}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-[#E9E7E2]/60">
          <span>{currentQuestion?.question?.category_number?.split(' ')[1]}</span>
          <span>/</span>
          <span>31</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 pt-2">
        <Progress 
          value={((Number(currentQuestion?.question?.category_number?.split(' ')[1]) || 1) / 31) * 100} 
          className="h-1 bg-white/10"
        />
      </div>

      {/* Question Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 py-8">
        <h1 className="text-3xl font-serif text-center mb-16 max-w-2xl">
          {currentQuestion?.question?.question}
        </h1>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Button
            variant="outline"
            className={`w-full py-6 text-lg font-medium ${
              selectedAnswer === "A"
                ? "bg-white/20 border-white/50"
                : "bg-white/5 border-white/20 hover:bg-white/10"
            }`}
            onClick={() => handleAnswer("A")}
          >
            YES
          </Button>
          
          <Button
            variant="outline"
            className={`w-full py-6 text-lg font-medium ${
              selectedAnswer === "B"
                ? "bg-white/20 border-white/50"
                : "bg-white/5 border-white/20 hover:bg-white/10"
            }`}
            onClick={() => handleAnswer("B")}
          >
            NO
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 text-lg font-medium mt-8 bg-transparent border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={!selectedAnswer}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DNAAssessment;
