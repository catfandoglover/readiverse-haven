
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, Hexagon, BookOpen, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveLastVisited, getLastVisited, saveScrollPosition, getScrollPosition } from "@/utils/navigationHistory";
import { Database } from "@/integrations/supabase/types";

type DNACategory = Database["public"]["Enums"]["dna_category"];

const categories: DNACategory[] = [
  "ETHICS",
  "EPISTEMOLOGY",
  "POLITICS",
  "THEOLOGY",
  "ONTOLOGY",
  "AESTHETICS"
];

const IntellectualDNA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    saveLastVisited('dna', location.pathname);

    // Restore scroll position when component mounts
    const savedPosition = getScrollPosition(location.pathname);
    if (savedPosition) {
      window.scrollTo(0, savedPosition);
    }

    // Save scroll position when component unmounts or location changes
    const handleScroll = () => {
      saveScrollPosition(location.pathname, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      handleScroll(); // Save final position before unmounting
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Prefetch questions for all categories
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

    if (showNameDialog) {
      prefetchQuestions();
    }
  }, [showNameDialog, queryClient]);

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['dna-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dna_assessment_progress')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
  });

  const handleNavigation = (path: string) => {
    if (path === '/dna' && location.pathname !== '/dna') {
      navigate('/dna');
    } else if (path === '/') {
      navigate(getLastVisited('discover'));
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf'));
    } else {
      navigate(path);
    }
  };

  const handleStartAssessment = () => {
    setShowNameDialog(true);
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      sessionStorage.setItem('dna_assessment_name', name.trim());
      setShowNameDialog(false);
      navigate('/dna/ethics');
    }
  };

  const isCurrentSection = (path: string) => {
    if (path === '/dna') {
      return location.pathname.startsWith('/dna');
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/bookshelf') {
      return location.pathname.startsWith('/bookshelf');
    }
    return false;
  };

  const buttonGradientStyles = "text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]";

  return (
    <div className="flex flex-col min-h-screen bg-[#E9E7E2]">
      <main className="flex-1 flex flex-col items-center justify-between p-4 max-w-lg mx-auto w-full">
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-6 py-12">
          {/* Your header content */}
          <div className="text-center">
            <p className="text-[#9b9b9b] uppercase">UNCOVER YOUR WORLDVIEW</p>
            
            <h1 className="text-3xl font-serif text-[#373763] mt-4">
              Trace your<br />
              Intellectual DNA
            </h1>
          </div>
            
            <div className="w-full -mx-4 px-2">
            <Button 
              variant="secondary"
              className="w-full py-4 rounded-full font-oxanium text-base uppercase bg-[#373763] text-[#E9E7E2] hover:bg-[#424278] transition-colors duration-200"
              onClick={() => handleNavigation('/dna')}
            >
              <span>GET STARTED</span>
            </Button>
          </div>
          
          <p className="text-[#9b9b9b] text-sm uppercase">ESTIMATED TIME: 10 MINUTES</p>
        </div>
        
        <div className="w-full text-center py-4">
          <p className="text-[#9b9b9b] uppercase text-sm">LIGHTNING</p>
        </div>
      </main>
    </div>
);

export default IntellectualDNA;
