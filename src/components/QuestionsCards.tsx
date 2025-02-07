
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

const QuestionImage = ({ src, alt }: { src: string | null; alt: string }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const fallbackImage = "/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png";

  const handleLoad = () => {
    console.log('Image loaded successfully:', src);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Error loading image:', src);
    setHasError(true);
    setIsLoading(false);
  };

  if (!src) {
    return <img src={fallbackImage} alt={alt} className="w-full h-full object-cover" />;
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ display: hasError ? 'none' : 'block' }}
      />
      {hasError && <img src={fallbackImage} alt={alt} className="w-full h-full object-cover" />}
    </>
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
        <CarouselProgress totalItems={questions?.length || 0} />
      </Carousel>
      
      <div className="flex justify-center mt-8">
        <Button 
          variant="secondary"
          className="px-8 py-2 text-[#E9E7E2] bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors duration-300 font-oxanium"
        >
          View all
        </Button>
      </div>
    </div>
  );
};

export default QuestionsCards;
