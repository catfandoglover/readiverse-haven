import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, Hexagon, BookOpen, Search, LogIn, LogOut, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { saveLastVisited, getLastVisited, saveScrollPosition, getScrollPosition } from "@/utils/navigationHistory";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/OutsetaAuthContext";

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
  const { user, isLoading, logout, openLogin, openSignup, openProfile } = useAuth();

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
    } else if (path === '/discover') {
      navigate(getLastVisited('discover'));
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf'));
    } else {
      navigate(path);
    }
  };

  const handleStartAssessment = () => {
    navigate('/dna/priming');
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

  return (
    <div className="flex flex-col min-h-screen bg-[#E9E7E2]">
      <header className="w-full p-4 flex justify-end">
        <div className="flex space-x-2">
          {isLoading ? (
            <Button disabled variant="outline" size="sm" className="text-[#373763]/70">
              Loading...
            </Button>
          ) : user ? (
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
          ) : (
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
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-4 w-full">
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 py-8 max-w-xl mx-auto">
          <div className="space-y-6 text-center w-full">
            <h2 className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold">
              UNCOVER YOUR WORLDVIEW
            </h2>
            
            <h1 className="font-baskerville text-[#373763] text-3xl md:text-4xl leading-tight">
              Trace your<br />Intellectual DNA
            </h1>
            
            <p className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold">
              ESTIMATED TIME: 10 MINUTES
            </p>
          </div>
        </div>

        {/* Continue button - Positioned at bottom like in PrimingScreens */}
        <div className="w-full max-w-md mb-16 px-6">
          <Button 
            onClick={handleStartAssessment}
            className="w-full py-6 rounded-2xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium text-sm font-bold uppercase tracking-wider"
          >
            GET STARTED
          </Button>
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
