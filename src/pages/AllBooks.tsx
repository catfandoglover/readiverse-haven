
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel
} from "@/components/ui/carousel";
import { Database } from "@/integrations/supabase/types";

type Book = Database['public']['Tables']['books']['Row'];

const categories = [
  'AESTHETICS',
  'EPISTEMOLOGY',
  'ETHICS',
  'ONTOLOGY',
  'POLITICS',
  'THEOLOGY'
] as const;

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

const CategoryBooks = ({ category, books }: { category: string, books: Book[] }) => {
  const categoryBooks = books.filter(book => 
    book.categories?.includes(category)
  );

  if (!categoryBooks.length) return null;

  return (
    <div className="space-y-6 mb-12">
      <h2 className="text-3xl font-oxanium text-center text-[#E9E7E2] uppercase">
        {category}
      </h2>
      
      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {categoryBooks.map((book) => (
            <CarouselItem key={book.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <Card 
                className="flex-none hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                onClick={() => window.open(book.Cover_super || undefined, '_blank')}
              >
                <div className="aspect-[2/3] w-full">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselProgress totalItems={categoryBooks.length} />
      </Carousel>
    </div>
  );
};

const AllBooks = () => {
  const { data: books, isLoading } = useQuery({
    queryKey: ['all-books'],
    queryFn: async () => {
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksError) {
        console.error('Error fetching books:', booksError);
        throw booksError;
      }

      return booksData as Book[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-3xl font-oxanium text-center text-[#E9E7E2] mb-12 uppercase">
        All Books
      </h1>
      
      {categories.map(category => (
        <CategoryBooks 
          key={category} 
          category={category} 
          books={books || []} 
        />
      ))}
    </div>
  );
};

export default AllBooks;
