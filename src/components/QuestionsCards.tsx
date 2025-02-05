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
      const { data: questions, error: questionsError } = await supabase
        .from('great_questions')
        .select('*, book_questions!inner(book_id), books!inner(book_questions(*))')
        .limit(6);

      if (questionsError) throw questionsError;

      // Transform the data to match our expected format
      const transformedQuestions = (questions as QuestionWithBooks[]).map(question => {
        const uniqueBooks = Array.from(
          new Set(
            question.books.map((book: Book) => book.id)
          )
        ).map(bookId => 
          question.books.find((book: Book) => book.id === bookId)
        ).filter((book): book is Book => book !== undefined);

        return {
          ...question,
          books: uniqueBooks
        };
      });

      return transformedQuestions;
    }
  });

  const handleBookClick = (coverUrl: string | null) => {
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
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
                      onClick={() => handleBookClick(book.Cover_super)}
                    >
                      <div className="cursor-pointer transition-transform hover:scale-105">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                          <img
                            src={book.cover_url || '/placeholder.svg'}
                            alt={book.title}
                            className="object-contain w-full h-full"
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