import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "./BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface BookshelfCarouselProps {
  queryKey: string;
  books?: any[];
  isLoading?: boolean;
}

const BookshelfCarousel: React.FC<BookshelfCarouselProps> = ({ 
  queryKey, 
  books: providedBooks,
  isLoading: providedLoading
}) => {
  const { user } = useAuth();
  
  const { data: fetchedBooks, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        console.log(`Fetching books for user: ${user.id}`);
        
        // First get the user books entries
        const { data: userBooks, error: userBooksError } = await supabase
          .from("user_books")
          .select("*")
          .eq("user_id", user.id);
        
        if (userBooksError) {
          console.error("Error fetching user books:", userBooksError);
          return [];
        }
        
        if (!userBooks?.length) {
          console.log("No user books found for user");
          return [];
        }
        
        // Then fetch the book details for each book ID
        const bookIds = userBooks.map(ub => ub.book_id);
        
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("id, title, author, cover_url, slug, epub_file_url")
          .in("id", bookIds);
          
        if (booksError) {
          console.error(`Error fetching books:`, booksError);
          return [];
        }
        
        // Combine the data
        return userBooks.map(ub => {
          const bookData = booksData?.find(b => b.id === ub.book_id);
          return {
            ...ub,
            ...bookData
          };
        });
      } catch (err) {
        console.error(`Exception fetching books:`, err);
        return [];
      }
    },
    enabled: !providedBooks && !!user?.id,
  });

  const books = providedBooks || fetchedBooks;
  const isLoading = providedLoading || fetchLoading;

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Fallback books if none found
  const fallbackBooks = [
    {
      id: "1",
      title: "Sample Book 1",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "2",
      title: "Sample Book 2",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "3",
      title: "Sample Book 3",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
  ];

  // Use books from database if available, otherwise use fallback
  const displayBooks = books?.length ? books : fallbackBooks;

  // Set options for better mobile display
  const carouselOptions = {
    align: "start" as const,
    loop: false,
    dragFree: true
  };

  return (
    <Carousel 
      opts={carouselOptions} 
      className="w-full pb-10 overflow-visible"
    >
      <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
        {displayBooks.map((book) => (
          <CarouselItem 
            key={book.id} 
            className="pl-2 md:pl-4 basis-[57%] md:basis-1/4 lg:basis-1/5"
          >
            <BookCard
              id={book.id}
              title={book.title || "Unknown Title"}
              author={book.author || "Unknown Author"}
              cover_url={book.cover_url}
              slug={book.slug}
              epub_file_url={book.epub_file_url}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-2" />
      <CarouselNext className="hidden md:flex -right-2" />
    </Carousel>
  );
};

export default BookshelfCarousel;
