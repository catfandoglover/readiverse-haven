
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, Hexagon, BookOpen, Search, LogIn, LogOut, User, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { saveLastVisited, getLastVisited, saveScrollPosition, getScrollPosition } from "@/utils/navigationHistory";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import MainMenu from "@/components/navigation/MainMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { user, logout, openLogin, openSignup, openProfile } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    // Save last visited page and restore scroll position
    saveLastVisited('dna', location.pathname);
    const savedPosition = getScrollPosition(location.pathname);
    
    if (savedPosition) {
      window.scrollTo(0, savedPosition);
    }

    // Setup scroll position tracking
    const handleScroll = () => {
      saveScrollPosition(location.pathname, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set page as ready after a short delay to ensure smooth rendering
    const readyTimer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);
    
    return () => {
      handleScroll(); // Save position before unmounting
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(readyTimer);
    };
  }, [location.pathname]);

  // Optimized data fetching - don't block rendering for non-essential data
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['dna-progress'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('dna_assessment_progress')
          .select('*')
          .order('created_at');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching DNA progress:', error);
        return null; // Return null instead of throwing to prevent UI errors
      }
    },
    staleTime: 60000, // Cache for 1 minute
    retry: 1,
  });

  const handleNavigation = (path: string) => {
    if (path === '/dna' && location.pathname !== '/dna') {
      navigate('/dna');
    } else if (path === '/discover') {
      navigate(getLastVisited('discover'));
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf'));
    } else {
      navigate(path);
    }
  };

  const handleStartAssessment = () => {
    try {
      // Prefetch initial data for the assessment to improve loading time
      queryClient.prefetchQuery({
        queryKey: ['dna-question', 'ETHICS', 'Q1'],
        queryFn: async () => {
          const { data } = await supabase
            .from('dna_tree_structure')
            .select(`
              *,
              question:great_questions!dna_tree_structure_question_id_fkey (
                question,
                category_number
              )
            `)
            .eq('category', 'ETHICS')
            .eq('tree_position', 'Q1')
            .maybeSingle();
          return data;
        },
      });
      
      navigate('/dna/priming');
    } catch (error) {
      console.error('Error navigating to assessment:', error);
      toast.error('Unable to start assessment. Please try again.');
    }
  };

  const isCurrentSection = (path: string) => {
    if (path === '/dna') {
      return location.pathname === '/dna' || location.pathname.startsWith('/dna/');
    }
    if (path === '/discover') {
      return location.pathname === '/discover';
    }
    if (path === '/bookshelf') {
      return location.pathname.startsWith('/bookshelf');
    }
    return false;
  };

  // Content loaded state - show skeleton during initial load
  if (!isPageReady) {
    return (
      <div className="flex flex-col min-h-screen bg-[#E9E7E2]">
        <header className="w-full p-4 flex justify-between items-center">
          <div><Skeleton className="h-10 w-10" /></div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-between px-4 py-4 w-full">
          <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 py-8 max-w-xl mx-auto">
            <div className="space-y-6 text-center w-full">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 mx-auto" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#E9E7E2]">
      <header className="w-full p-4 flex justify-between items-center">
        <div>
          <MainMenu />
        </div>
        <div className="flex space-x-2">
          {user ? (
            <>
              <Button 
                onClick={openProfile} 
                variant="outline" 
                size="sm" 
                className="bg-[#373763]/10 text-[#373763] hover:bg-[#373763]/20 border-[#373763]/20"
                title={`Profile: ${user.Account?.Name || user.email}`}
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline truncate max-w-[100px]">{user.Account?.Name || user.email}</span>
              </Button>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm" 
                className="bg-[#373763]/10 text-[#373763] hover:bg-[#373763]/20 border-[#373763]/20"
                title="Logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={openLogin} 
                variant="outline" 
                size="sm" 
                className="bg-[#373763]/10 text-[#373763] hover:bg-[#373763]/20 border-[#373763]/20"
                title="Login"
              >
                <LogIn className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button 
                onClick={openSignup} 
                variant="outline" 
                size="sm" 
                className="bg-[#373763]/10 text-[#373763] hover:bg-[#373763]/20 border-[#373763]/20"
                title="Sign Up"
              >
                <User className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-4 w-full">
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 py-8 max-w-xl mx-auto">
          <div className="space-y-6 text-center w-full">
            <h2 className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold">
              UNCOVER YOUR WORLDVIEW
            </h2>
            
            <h1 className="font-libre-baskerville font-bold text-[#373763] text-3xl md:text-4xl leading-tight">
              Trace your<br />Intellectual DNA
            </h1>
            
            <div className="w-full px-2 flex justify-center">
              <Button 
                className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm uppercase font-bold tracking-wider"
                onClick={handleStartAssessment}
              >
                GET STARTED
              </Button>
            </div>

            <p className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold">
              ESTIMATED TIME: 10 MINUTES
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center pb-4">
          <p className="font-oxanium text-[#282828] uppercase tracking-wider text-sm font-bold">
            LIGHTNING
          </p>
        </div>
      </main>
    </div>
  );
};

export default IntellectualDNA;
