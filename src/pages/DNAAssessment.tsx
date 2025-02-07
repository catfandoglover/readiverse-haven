
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

  const { data: currentQuestion, isLoading } = useQuery({
    queryKey: ['dna-question', category],
    queryFn: async () => {
      // For now, just get the first question for the category
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
        .eq('tree_position', 'Q1')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleAnswer = (answer: "A" | "B") => {
    setSelectedAnswer(answer);
  };

  const handleContinue = () => {
    if (!selectedAnswer) return;
    // We'll implement the navigation logic later
    console.log("Selected answer:", selectedAnswer);
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
