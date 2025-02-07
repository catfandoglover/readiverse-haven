
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  useCarousel 
} from "./ui/carousel";
import { Database } from "@/integrations/supabase/types";

type Question = Database['public']['Tables']['great_questions']['Row'];

const CarouselProgress = ({ totalItems }: { totalItems: number }) => {
  const { api } = useCarousel();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const maxDots = 5;
  const visibleDots = Math.min(maxDots, totalItems);

  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: visibleDots }).map((_, idx) => (
        <img
          key={idx}
          src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png"
          alt={`Slide ${idx + 1}`}
          className={`w-4 h-4 transition-opacity duration-300 mix-blend-screen ${
            idx === activeIndex ? 'opacity-100' : 'opacity-30'
          }`}
        />
      ))}
    </div>
  );
};

const QuestionsCards = () => {
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('great_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(18);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      return questionsData as Question[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] mb-8 uppercase">
        The Great Questions
      </h1>
      
      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {questions?.map((question) => (
            <CarouselItem key={question.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <Card 
                className="overflow-hidden h-full"
                style={{
                  background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
                }}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1 mb-4">
                    <h3 className="text-base font-oxanium text-[#E9E7E2] text-center line-clamp-3">
                      {question.question}
                    </h3>
                  </div>
                  
                  <div className="bg-[#2A282A]/30 backdrop-blur-sm rounded-lg p-4">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-md">
                      <img
                        src={question.illustration}
                        alt="Question illustration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselProgress totalItems={questions?.length || 0} />
      </Carousel>
      
      <div className="flex flex-col gap-3 py-6">
        <Button 
          variant="secondary"
          className="w-full text-[#E9E7E2] bg-[#2A282A]/50 hover:bg-[#2A282A]/70"
        >
          Show more
        </Button>
        <Button 
          variant="secondary"
          className="w-full text-[#E9E7E2] bg-[#2A282A]/50 hover:bg-[#2A282A]/70"
        >
          Edit vibes
        </Button>
        <Button 
          variant="secondary"
          className="w-full text-[#E9E7E2] bg-[#2A282A]/50 hover:bg-[#2A282A]/70"
        >
          New vibes
        </Button>
      </div>
    </div>
  );
};

export default QuestionsCards;
