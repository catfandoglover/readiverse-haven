
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, LibraryBig, Dna, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const IntellectualDNA = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate(path);
  };

  const handleStartAssessment = () => {
    navigate('/dna/ethics');
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
        <header className="px-4 py-3 border-b border-white/10 sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
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

        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background py-2 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/dna') ? 'border-b-2 border-[#9b87f5]' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <div className={`relative ${isCurrentSection('/dna') ? 'after:absolute after:bottom-[-8px] after:left-[-20px] after:right-[-20px] after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]' : ''}`}>
                <Dna className="h-6 w-6" />
              </div>
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/') ? 'border-b-2 border-[#9b87f5]' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <div className={`relative ${isCurrentSection('/') ? 'after:absolute after:bottom-[-8px] after:left-[-20px] after:right-[-20px] after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]' : ''}`}>
                <Compass className="h-6 w-6" />
              </div>
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/bookshelf') ? 'border-b-2 border-[#9b87f5]' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <div className={`relative ${isCurrentSection('/bookshelf') ? 'after:absolute after:bottom-[-8px] after:left-[-20px] after:right-[-20px] after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]' : ''}`}>
                <LibraryBig className="h-6 w-6" />
              </div>
              <span className="text-xs font-oxanium">Bookshelf</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default IntellectualDNA;

