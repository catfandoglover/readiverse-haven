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
}

const QuestionsCards = () => {
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions-with-books'],
    queryFn: async () => {
      // First, get questions
      const { data: questions, error: questionsError } = await supabase
        .from('great_questions')
        .select('*')
        .limit(6);

      if (questionsError) throw questionsError;

      // For each question, get related books
      const questionsWithBooks = await Promise.all(
        questions.map(async (question) => {
          const { data: bookQuestions, error: bookQuestionsError } = await supabase
            .from('book_questions')
            .select('book_id')
            .eq('question_id', question.id);

          if (bookQuestionsError) throw bookQuestionsError;

          const bookIds = bookQuestions.map(bq => bq.book_id);
          
          const { data: books, error: booksError } = await supabase
            .from('books')
            .select('*')
            .in('id', bookIds);

          if (booksError) throw booksError;

          return {
            ...question,
            books: books || []
          };
        })
      );

      return questionsWithBooks;
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
      {questions?.map((question) => (
        <Card 
          key={question.id}
          className="overflow-hidden"
          style={{
            background: 'linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)'
          }}
        >
          <div className="p-6">
            <h3 className="text-xl font-georgia mb-4 text-gray-800">
              {question.question}
            </h3>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
              <Carousel>
                <CarouselContent>
                  {question.books.map((book) => (
                    <CarouselItem key={book.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <div className="space-y-2">
                        <div className="aspect-[2/3] relative overflow-hidden rounded-md">
                          <img
                            src={book.cover_url || '/placeholder.svg'}
                            alt={book.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold truncate">{book.title}</p>
                          {book.author && (
                            <p className="text-gray-600 text-xs truncate">{book.author}</p>
                          )}
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