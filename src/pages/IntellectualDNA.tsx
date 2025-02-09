
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, LibraryBig, Dna, Search } from "lucide-react";
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
            My DNA
          </h1>
          
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <p className="text-foreground/60 text-center mb-8">
              Discover your intellectual DNA through our comprehensive assessment
            </p>
            <Button
              onClick={handleStartAssessment}
              className="w-full py-6 text-lg bg-secondary hover:bg-secondary/90 text-foreground"
              size="lg"
            >
              Start Assessment
            </Button>
          </div>
        </div>

        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent>
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
              <Button onClick={handleNameSubmit} disabled={!name.trim()}>
                Begin Assessment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <Dna className="h-6 w-6" />
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs font-oxanium">Bookshelf</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default IntellectualDNA;
