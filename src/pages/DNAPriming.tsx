
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimingScreens from "@/components/dna/PrimingScreens";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
];

const DNAPriming = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchQuestions = async () => {
      console.log('Starting to prefetch questions for all categories');
      
      for (const category of categories) {
        console.log(`Prefetching questions for category: ${category}`);
        
        // Prefetch initial question (Q1) for each category
        await queryClient.prefetchQuery({
          queryKey: ['dna-question', category, 'Q1'],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('dna_tree_structure')
              .select(`
                *,
                question:great_questions!dna_tree_structure_question_id_fkey (
                  question,
                  category_number
                )
              `)
              .eq('category', category)
              .eq('tree_position', 'Q1')
              .maybeSingle();

            if (error) {
              console.error('Error prefetching questions:', error);
              throw error;
            }

            console.log(`Successfully prefetched Q1 for ${category}`);
            return data;
          },
        });
      }
      
      console.log('Completed prefetching questions for all categories');
    };

    prefetchQuestions();
  }, [queryClient]);

  const handlePrimingComplete = (userName: string) => {
    // Set default name if empty
    const finalName = userName.trim() || "Anonymous";
    sessionStorage.setItem('dna_assessment_name', finalName);
    navigate('/dna/ethics');
  };

  return (
    <PrimingScreens onComplete={handlePrimingComplete} />
  );
};

export default DNAPriming;
