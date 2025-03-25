
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Share, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormatText } from "@/hooks/useFormatText";
import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";

type Question = Database['public']['Tables']['great_questions']['Row'];

interface GreatQuestionDetailedViewProps {
  data: Question;
  onBack?: () => void;
}

const GreatQuestionDetailedView: React.FC<GreatQuestionDetailedViewProps> = ({
  data,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatText } = useFormatText();
  const [shouldBlurHeader, setShouldBlurHeader] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save this page as the last visited in the discover section
    if (data?.id) {
      saveLastVisited("discover", `/great-questions/${data.id}`);
    }
  }, [data?.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        setShouldBlurHeader(scrollTop > 50);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">No question data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className={`sticky top-0 z-10 bg-background transition-all duration-300 ${shouldBlurHeader ? 'bg-background/80 backdrop-blur-md' : ''}`}>
        <div className="px-4 py-3 flex justify-between items-center">
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-all duration-200">
              <Share className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-all duration-200">
              <Star className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h1 className="text-xl md:text-2xl font-baskervville text-foreground">
            {data.question}
          </h1>
          <div className="mt-2 flex items-center">
            <p className="text-xs md:text-sm font-oxanium text-[#9b87f5] uppercase">
              {data.category || 'Philosophy'}
            </p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="px-4 pb-16">
          {data.illustration && (
            <Card className="overflow-hidden border-0 mb-6">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={data.illustration} 
                  alt={`Illustration for "${data.question}"`}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}

          <div className="prose prose-invert max-w-none">
            <div className="text-[#E9E7E2] leading-relaxed text-base md:text-lg space-y-4">
              {formatText(data.great_conversation)}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GreatQuestionDetailedView;
