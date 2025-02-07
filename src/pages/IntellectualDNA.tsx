
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, LibraryBig, Dna, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  { name: 'ETHICS', title: 'Ethics', description: 'Explore questions of right and wrong' },
  { name: 'AESTHETICS', title: 'Aesthetics', description: 'Discover your relationship with beauty' },
  { name: 'POLITICS', title: 'Politics', description: 'Understand your political foundations' },
  { name: 'THEOLOGY', title: 'Theology', description: 'Examine your views on the divine' },
  { name: 'ONTOLOGY', title: 'Ontology', description: 'Question the nature of reality' },
  { name: 'EPISTEMOLOGY', title: 'Epistemology', description: 'Explore how we know what we know' }
] as const;

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

  const handleStartAssessment = (category: string) => {
    navigate(`/dna/${category.toLowerCase()}`);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8">
            My DNA
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => {
              const categoryProgress = progress?.find(p => p.category === category.name);
              
              return (
                <Card 
                  key={category.name}
                  className="p-6 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleStartAssessment(category.name)}
                >
                  <h3 className="text-lg font-oxanium text-[#E9E7E2] mb-2">{category.title}</h3>
                  <p className="text-sm text-[#E9E7E2]/60 mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#E9E7E2]/40">
                      {categoryProgress?.completed ? 'Completed' : 'Not started'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {categoryProgress?.completed ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2">
          <div className="flex justify-between items-center max-w-sm mx-auto px-8">
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/dna') ? 'border-b-2 border-b-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-none' : ''}`}
              onClick={() => handleNavigation('/dna')}
            >
              <Dna className="h-6 w-6" />
              <span className="text-xs font-oxanium">My DNA</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/') ? 'border-b-2 border-b-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-none' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </button>
            <button 
              className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${isCurrentPath('/bookshelf') ? 'border-b-2 border-b-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-none' : ''}`}
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
