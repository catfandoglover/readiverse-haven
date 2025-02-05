import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  useCarousel 
} from "./ui/carousel";
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

const CarouselProgress = ({ books }: { books: Book[] }) => {
  const { api } = useCarousel();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex justify-center gap-2 mt-2">
      {books.map((_, idx) => (
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
    queryKey: ['questions-with-books'],
    queryFn: async () => {
      console.log('Fetching questions and books...');
      
      // First, get all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('book_questions')
        .select(`
          question_id,
          book_id,
          great_questions!inner(*),
          books(*)
        `)
        .order('randomizer');

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      console.log('Raw questions data:', questionsData);

      // Group by question
      const questionMap = new Map<string, QuestionWithBooks>();

      questionsData?.forEach((relation: any) => {
        const questionId = relation.question_id;
        const book = relation.books;
        const question = relation.great_questions;

        if (!questionMap.has(questionId)) {
          questionMap.set(questionId, {
            ...question,
            books: [],
            book_questions: []
          });
        }

        const existingQuestion = questionMap.get(questionId)!;
        
        // Only add the book if it's not already in the array
        if (book && !existingQuestion.books.some(b => b.id === book.id)) {
          existingQuestion.books.push(book);
        }
      });

      const transformedQuestions = Array.from(questionMap.values());
      
      // Log each question and its books for debugging
      transformedQuestions.forEach(question => {
        console.log(`Question "${question.question}" has ${question.books.length} books:`, question.books);
      });

      return transformedQuestions as QuestionWithBooks[];
    }
  });

  const handleBookClick = (book: Book) => {
    if (book.Cover_super) {
      window.open(book.Cover_super, '_blank');
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
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="cursor-pointer transition-transform hover:scale-105">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                          <img
                            src={book.cover_url || '/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png'}
                            alt={book.title || 'Book cover'}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png';
                            }}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselProgress books={question.books} />
              </Carousel>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuestionsCards;