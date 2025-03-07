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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-50 bg-background">
          <div className="flex justify-between items-center">
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </button>
            <button
              onClick={() => handleNavigation('/search')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-oxanium text-center text-foreground uppercase mb-8">
            Trace Your Intellectual DNA
          </h1>
          
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <p className="text-foreground/80 text-center mb-8 leading-relaxed">
              Your intellectual DNA contains traces of the conversations that have shaped your inner and outer world. By decoding it, you discover not just who you are, but who you can become.
            </p>
            <p className="text-foreground/80 text-center mb-8 leading-relaxed">
              Learning is a practice that can change your life. The history of thought is not simply a catalogue of theories that are either right or wrong, but a great conversation, one that you can join.
            </p>
            <Button
              onClick={handleStartAssessment}
              className={`${buttonGradientStyles} w-full py-6 text-lg`}
              size="lg"
            >
              <span>Start Assessment</span>
            </Button>
          </div>
        </div>

        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent className="fixed top-4 translate-y-0 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enter Your Name</DialogTitle>
              <DialogDescription>
                Please enter your name to begin the DNA assessment.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSubmit();
                  }
                }}
              />
              <Button 
                onClick={handleNameSubmit} 
                disabled={!name.trim()}
                className={buttonGradientStyles}
              >
                <span>Begin Assessment</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50" style={{ aspectRatio: "1290/152", maxHeight: "152px" }}>
          <div className="flex justify-center items-center h-full">
            <div className="flex justify-between items-center w-full max-w-xs px-4">
              <button 
                className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
                onClick={() => handleNavigation('/')}
              >
                <Compass className="h-6 w-6" />
                <span className="text-xs uppercase font-oxanium">Discover</span>
              </button>
              <button 
                className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
                onClick={() => handleNavigation('/dna')}
              >
                <div className="relative">
                  <Hexagon className="h-7 w-7" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 bg-[#E9E7E2] rounded-full transform rotate-45" style={{ borderRadius: "50% 50% 50% 0" }}></div>
                  </div>
                </div>
                <span className="text-xs uppercase font-oxanium">My DNA</span>
              </button>
              <button 
                className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
                onClick={() => handleNavigation('/bookshelf')}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-xs uppercase font-oxanium">Study</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default IntellectualDNA;
