
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const TheologyContent: React.FC = () => {
  const { user } = useAuth();
  
  const { data: books, isLoading } = useQuery({
    queryKey: ["theology-user-books", user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid) return [];

      try {
        console.log("Fetching theology books for user:", user.Account.Uid);
        
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
          .in("id", bookIds)
          .ilike('categories', '%theology%');
          
        if (booksError) {
          console.error("Error fetching theology books:", booksError);
          return [];
        }
        
        // Combine the data
        return userBooks
          .filter(ub => booksData.some(b => b.id === ub.book_id))
          .map(ub => {
            const bookData = booksData.find(b => b.id === ub.book_id);
            return {
              ...ub,
              ...bookData
            };
          });
      } catch (err) {
        console.error("Exception fetching theology books:", err);
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

  // If no books from the database, use our fallback
  const displayBooks = books?.length ? books : [
    {
      id: "1",
      title: "Summa Theologica",
      author: "Thomas Aquinas",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "2",
      title: "The City of God",
      author: "Augustine of Hippo",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "3",
      title: "Fear and Trembling",
      author: "Søren Kierkegaard",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
  ];

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

export default TheologyContent;
