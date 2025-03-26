
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

const CarouselBooksContent: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: books, isLoading } = useQuery({
    queryKey: ["all-user-books", user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid) return [];

      try {
        console.log("Fetching books for user:", user.Account.Uid);
        
        // First get the user books entries
        const { data: userBooks, error: userBooksError } = await supabase
          .from("user_books")
          .select("*")
          .eq("outseta_user_id", user.Account.Uid);
        
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
          console.error("Error fetching books:", booksError);
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
        console.error("Exception fetching all books:", err);
        return [];
      }
    },
    enabled: !!user?.Account?.Uid,
  });

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[#2A282A]/60">No books found in your library</p>
        <p className="text-[#2A282A]/60 mt-2">Start adding books to see them here</p>
      </div>
    );
  }

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
        {books.map((book) => (
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

export default CarouselBooksContent;
