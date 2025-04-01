
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimingScreens from "@/components/dna/PrimingScreens";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
] as const;

type Category = typeof categories[number];

const DNAPriming = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [prefetchProgress, setPrefetchProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const prefetchQuestions = async () => {
      console.log('Starting to prefetch questions for all categories');
      setIsPrefetching(true);
      
      try {
        // Prefetch the first questions immediately to ensure they're ready
        await queryClient.prefetchQuery({
          queryKey: ['dna-question', 'ETHICS', 'Q1'],
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
              .eq('category', 'ETHICS')
              .eq('tree_position', 'Q1')
              .maybeSingle();

            if (error) throw error;
            return data;
          },
          staleTime: 5 * 60 * 1000,
        });
        
        if (mounted) setPrefetchProgress(20); // Show some progress immediately

        // Then prefetch the rest
        const totalCategories = categories.length;
        
        for (let i = 0; i < totalCategories; i++) {
          const category = categories[i];
          if (category === 'ETHICS' && i === 0) continue; // Skip ETHICS if it's first since we already fetched it

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
                    category_number,
                    answer_a,
                    answer_b
                  )
                `)
                .eq('category', category)
                .eq('tree_position', 'Q1')
                .maybeSingle();

              if (error) throw error;
              console.log(`Successfully prefetched Q1 for ${category}`);
              return data;
            },
            staleTime: 5 * 60 * 1000,
          });
          
          // Update progress
          if (mounted) {
            const progress = Math.min(20 + Math.round((i + 1) / totalCategories * 80), 100);
            setPrefetchProgress(progress);
          }
        }
      } catch (error) {
        console.error('Error prefetching questions:', error);
        // Don't block the user experience due to prefetch errors
      } finally {
        if (mounted) {
          setIsPrefetching(false);
          setPrefetchProgress(100);
        }
      }
      
      console.log('Completed prefetching questions for all categories');
    };

    prefetchQuestions();
    
    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const handlePrimingComplete = (userName: string) => {
    try {
      // Set default name if empty
      const finalName = userName.trim() || "Anonymous";
      sessionStorage.setItem('dna_assessment_name', finalName);
      
      // If prefetching is still in progress but over 20%, continue anyway
      // since we've at least loaded the first questions
      if (isPrefetching && prefetchProgress < 20) {
        toast.info("Still preparing questions. Please wait a moment...");
        return;
      }
      
      navigate('/dna/ethics');
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Unable to start assessment. Please try again.');
    }
  };

  return (
    <PrimingScreens 
      onComplete={handlePrimingComplete} 
      isPrefetching={isPrefetching && prefetchProgress < 20}
      prefetchProgress={prefetchProgress}
    />
  );
};

export default DNAPriming;
