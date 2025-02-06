
import React, { useState, useEffect } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

type Question = Database['public']['Tables']['great_questions']['Row'];
type Book = Database['public']['Tables']['books']['Row'];

interface QuestionWithBooks extends Question {
  books: Book[];
}

const CarouselProgress = ({ books, hasMore }: { books: Book[], hasMore: boolean }) => {
  const { api } = useCarousel();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const maxDots = 6;
  const dotsToShow = Math.min(maxDots, books.length);
  const shouldShowLastDot = !hasMore || books.length <= maxDots;
  const visibleDots = shouldShowLastDot ? dotsToShow : dotsToShow - 1;

  return (
    <div className="flex justify-center gap-2 mt-2">
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

const BookCover = ({ book }: { book: Book }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [primaryImageFailed, setPrimaryImageFailed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!book.cover_url) {
      setIsLoading(false);
      setPrimaryImageFailed(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setPrimaryImageFailed(false);
    };
    
    img.onerror = () => {
      console.log(`Primary image load failed for book: ${book.title}`);
      setIsLoading(false);
      setPrimaryImageFailed(true);
    };
    
    const url = book.cover_url.includes('dropbox.com')
      ? book.cover_url.replace('?dl=0', '?raw=1')
      : book.cover_url;
    
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [book.cover_url, book.title]);

  const fallbackImage = "/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png";

  return (
    <div className="aspect-square relative overflow-hidden rounded-md">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
      <img
        src={primaryImageFailed ? fallbackImage : book.cover_url || fallbackImage}
        alt={book.title || 'Book cover'}
        className={`object-contain w-full h-full transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
        loading={isMobile ? "lazy" : "eager"}
      />
    </div>
  );
};

const QuestionsCards = () => {
  const [visibleQuestions, setVisibleQuestions] = useState(6);
  const isMobile = useIsMobile();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions-with-books'],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('great_questions')
        .select(`
          *,
          book_questions!inner(
            books(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(18);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      const transformedQuestions = questionsData.map((question: any) => {
        const uniqueBooks = new Map();
        
        question.book_questions.forEach((bq: any) => {
          if (bq.books) {
            uniqueBooks.set(bq.books.id, bq.books);
          }
        });
        
        const uniqueBooksArray = Array.from(uniqueBooks.values());
        return {
          ...question,
          books: uniqueBooksArray
        };
      });

      return transformedQuestions as QuestionWithBooks[];
    }
  });

  const handleBookClick = (book: Book) => {
    if (book.Cover_super) {
      window.open(book.Cover_super, '_blank');
    }
  };

  const handleLoadMore = () => {
    setVisibleQuestions(prev => Math.min((prev + 6), questions?.length || 0));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse">Loading questions...</div>
      </div>
    );
  }

  const displayedQuestions = questions?.slice(0, visibleQuestions) || [];
  const hasMoreQuestions = questions ? visibleQuestions < questions.length : false;

  return (
    <div className="space-y-6 p-4">
      {displayedQuestions.map((question) => (
        <Card 
          key={question.id}
          className="overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
          }}
        >
          <div className="p-6">
            <h3 className="text-base font-oxanium mb-4 text-white text-center">
              {question.question}
            </h3>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <Carousel>
                <CarouselContent className="-ml-1">
                  {question.books.map((book) => (
                    <CarouselItem 
                      key={book.id} 
                      className="pl-1 basis-full sm:basis-1/3"
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="cursor-pointer transition-transform hover:scale-105">
                        <BookCover book={book} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselProgress books={question.books} hasMore={hasMoreQuestions} />
              </Carousel>
            </div>
          </div>
        </Card>
      ))}
      
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 py-6">
        <Button 
          variant="outline" 
          className="text-foreground border-[#FEF7CD] hover:bg-[#FEF7CD]/10"
          onClick={handleLoadMore}
          disabled={visibleQuestions >= (questions?.length || 0)}
        >
          More Questions
        </Button>
        <Button 
          variant="outline"
          className="text-foreground border-[#FEF7CD] hover:bg-[#FEF7CD]/10"
        >
          What do you want to ask
        </Button>
      </div>
    </div>
  );
};

export default QuestionsCards;

