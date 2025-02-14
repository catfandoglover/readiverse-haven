
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Question = Database['public']['Tables']['great_questions']['Row'];

export const QuestionImage = ({ src, alt }: { src: string | null; alt: string }) => {
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
  const navigate = useNavigate();
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
    <div className="space-y-4 p-4 mb-8">
      <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8">
        The Great Questions
      </h1>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-4 min-w-min">
          {questions?.map((question) => (
            <Card 
              key={question.id}
              className="flex-none w-[85vw] md:w-[400px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
              }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1 mb-4">
                  <h3 className="text-base md:text-lg font-baskervville text-[#E9E7E2] text-center line-clamp-3">
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
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-16">
        <Button 
          variant="secondary"
          className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]"
          onClick={() => navigate('/great-questions')}
        >
          <span>VIEW ALL</span>
        </Button>
      </div>
    </div>
  );
};

export default QuestionsCards;
