
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";

type DNACategory = Database["public"]["Enums"]["dna_category"];

// Define the order of categories
const categoryOrder: DNACategory[] = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
];

const DNAAssessment = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [currentPosition, setCurrentPosition] = React.useState("Q1");

  // Convert category to uppercase to match the enum type
  const upperCategory = category?.toUpperCase() as DNACategory;

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
    enabled: !!upperCategory
  });

  const handleAnswer = async (answer: "A" | "B") => {
    if (!currentQuestion) return;

    // Get the next question ID based on the selected answer
    const nextQuestionId = answer === "A" 
      ? currentQuestion.next_question_a_id 
      : currentQuestion.next_question_b_id;

    // If there's no next question, the current category is complete
    if (!nextQuestionId) {
      // Find the current category index
      const currentCategoryIndex = categoryOrder.findIndex(cat => cat === upperCategory);
      
      // If we're not at the last category, move to the next one
      if (currentCategoryIndex < categoryOrder.length - 1) {
        const nextCategory = categoryOrder[currentCategoryIndex + 1].toLowerCase();
        navigate(`/dna/${nextCategory}`);
        setCurrentPosition("Q1");
        return;
      }
      
      // If we're at the last category, go back to DNA home
      navigate('/dna');
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
        return;
      }

      if (!nextQuestion) {
        console.error('Next question not found for ID:', nextQuestionId);
        return;
      }

      // Update the current position
      setCurrentPosition(nextQuestion.tree_position);
    } catch (error) {
      console.error('Error in question transition:', error);
    }
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="font-oxanium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="px-4 py-3">
          <button 
            onClick={() => navigate('/dna')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
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
            className="px-8 py-2 text-foreground bg-background hover:bg-accent transition-colors duration-300 font-oxanium"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="px-4 py-3">
          <button 
            onClick={() => navigate('/dna')}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
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
            className="px-8 py-2 text-foreground bg-background hover:bg-accent transition-colors duration-300 font-oxanium"
          >
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const currentCategoryIndex = categoryOrder.findIndex(cat => cat === upperCategory);
  const questionNumber = parseInt(currentPosition.substring(1));
  const totalProgress = ((currentCategoryIndex * 5) + questionNumber) / (categoryOrder.length * 5) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dna')}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 text-sm font-oxanium text-foreground mr-3">
          <span>{((currentCategoryIndex * 5) + questionNumber)}</span>
          <span>/</span>
          <span>{categoryOrder.length * 5}</span>
        </div>
      </header>
      <div className="px-4">
        <Progress 
          value={totalProgress}
          className="bg-secondary/10"
        />
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 py-8">
        <h1 className="text-3xl font-oxanium text-center mb-16 max-w-2xl">
          {currentQuestion.question?.question}
        </h1>
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Button
            variant="outline"
            className="w-full py-6 text-lg font-oxanium bg-background hover:bg-accent transition-colors duration-300"
            onClick={() => handleAnswer("A")}
          >
            YES
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 text-lg font-oxanium bg-background hover:bg-accent transition-colors duration-300"
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
