
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

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-[#E9E7E2]">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-white/10 sticky top-0 z-10 bg-[#1A1F2C]">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8">
            My DNA
          </h1>
          
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <p className="text-[#E9E7E2]/60 text-center mb-8">
              Discover your intellectual DNA through our comprehensive assessment
            </p>
            <Button
              onClick={handleStartAssessment}
              className="w-full py-6 text-lg bg-[#2A282A] hover:bg-[#2A282A]/90 text-[#E9E7E2]"
              size="lg"
            >
              Start Assessment
            </Button>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#1A1F2C] py-2 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentPath('/dna') ? 'border-b-2 border-[#9b87f5]' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <Dna className="h-6 w-6" />
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentPath('/') ? 'border-b-2 border-[#9b87f5]' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'border-b-2 border-[#9b87f5]' : ''}`}
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
