
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem
} from "@/components/ui/carousel";
import { Database } from "@/integrations/supabase/types";
import { QuestionImage } from "@/components/QuestionsCards";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, LibraryBig, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type Question = Database['public']['Tables']['great_questions']['Row'];

const categories = [
  'AESTHETICS',
  'EPISTEMOLOGY',
  'ETHICS',
  'ONTOLOGY',
  'POLITICS',
  'THEOLOGY'
] as const;

const CategoryQuestions = ({ category, questions }: { category: string, questions: Question[] }) => {
  if (!questions.length) return null;

  return (
    <div className="space-y-6 mb-12">
      <h2 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase">
        {category}
      </h2>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          watchDrag: true,
          dragThreshold: 1
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {questions.map((question) => (
            <CarouselItem key={question.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <Card 
                className="overflow-hidden h-full"
                style={{
                  background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
                }}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1 mb-4">
                    <h3 className="text-base md:text-lg font-oxanium text-[#E9E7E2] text-center line-clamp-3">
                      {question.question}
                    </h3>
                  </div>
                  
                  <div className="bg-[#2A282A]/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-md">
                      <QuestionImage 
                        src={question.illustration} 
                        alt={`Illustration for "${question.question}"`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

const GreatQuestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: questions, isLoading } = useQuery({
    queryKey: ['all-questions'],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('great_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      return questionsData as Question[];
    }
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-[#E9E7E2]">Loading questions...</div>
      </div>
    );
  }

  const questionsByCategory = categories.reduce((acc, category) => {
    acc[category] = questions?.filter(q => q.category === category) || [];
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="min-h-screen bg-[#2A282A] pb-[60px]">
      <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-[#2A282A]">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => handleNavigation('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        <h1 className="text-3xl font-oxanium text-center text-[#E9E7E2] mb-12 uppercase">
          The Great Questions
        </h1>
        
        {categories.map(category => (
          <CategoryQuestions 
            key={category} 
            category={category} 
            questions={questionsByCategory[category]} 
          />
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-[#2A282A] py-2 z-50">
        <div className="flex justify-center items-center gap-8 max-w-md mx-auto px-4">
          <Button 
            variant="ghost"
            size="icon" 
            className={`flex flex-col items-center gap-1 w-14 text-foreground ${isCurrentPath('/') ? 'border-b-2 border-primary rounded-none' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs font-oxanium">Discover</span>
          </Button>
          <Button 
            variant="ghost"
            size="icon" 
            className={`flex flex-col items-center gap-1 w-14 text-foreground ${isCurrentPath('/bookshelf') ? 'border-b-2 border-primary rounded-none' : ''}`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <LibraryBig className="h-6 w-6" />
            <span className="text-xs font-oxanium">Bookshelf</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default GreatQuestions;

