import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { Database } from "@/integrations/supabase/types";

type Question = Database['public']['Tables']['great_questions']['Row'];
type Book = Database['public']['Tables']['books']['Row'];

interface QuestionWithBooks extends Question {
  books: Book[];
  book_questions: {
    book_id: string;
    created_at: string;
    question_id: string;
    randomizer: number;
  }[];
}

const QuestionsCards = () => {
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions-with-books'],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('great_questions')
        .select(`
          *,
          book_questions(book_id, created_at, question_id, randomizer),
          books:book_questions(books(*))
        `)
        .limit(6);

      if (questionsError) throw questionsError;

      // Transform the data to match our expected format
      const transformedQuestions = (questionsData || []).map((question: any) => {
        // Extract books from the nested structure
        const books = question.books?.map((bookRelation: any) => bookRelation.books) || [];
        
        return {
          ...question,
          books: books.filter((book: Book | null): book is Book => book !== null)
        };
      });

      return transformedQuestions as QuestionWithBooks[];
    }
  });

  const handleBookClick = (coverUrl: string | null) => {
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
  };

  const getBookCoverUrl = (book: Book) => {
    // Try Cover_super first, then fall back to cover_url
    return book.Cover_super || book.cover_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {questions?.map((question) => (
        <Card 
          key={question.id}
          className="overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
          }}
        >
          <div className="p-6">
            <h3 className="text-xl font-georgia mb-4 text-white">
              {question.question}
            </h3>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <Carousel>
                <CarouselContent className="-ml-1">
                  {question.books.map((book) => (
                    <CarouselItem 
                      key={book.id} 
                      className="pl-1 basis-full sm:basis-1/3"
                      onClick={() => handleBookClick(getBookCoverUrl(book))}
                    >
                      <div className="cursor-pointer transition-transform hover:scale-105">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                          <img
                            src={getBookCoverUrl(book)}
                            alt={book.title || 'Book cover'}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                            }}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuestionsCards;