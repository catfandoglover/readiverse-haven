import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: customShelves = [] } = useQuery({
    queryKey: ["user-shelves", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_shelves")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching custom shelves:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });
  
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

  const handleRemoveBook = async (bookId: string) => {
    if (!user?.id) return;
    try {
      console.log(`Removing book ${bookId} for user ${user.id}`);
      const { error } = await supabase
        .from("user_books")
        .delete()
        .match({ user_id: user.id, book_id: bookId });

      if (error) throw error;

      toast({ title: "Book removed", description: "Successfully removed from your bookshelf." });
      console.log(`Invalidating query: ${queryKey}`);
      queryClient.invalidateQueries({ queryKey: [queryKey, user?.id] });
    } catch (error: any) {
      console.error("Error removing book:", error);
      toast({ title: "Error", description: `Could not remove book: ${error.message}`, variant: "destructive" });
    }
  };

  const handleAddBookToShelf = async (bookId: string, shelfId: string) => {
    if (!user?.id) return;
    try {
      console.log(`Adding book ${bookId} to shelf ${shelfId} for user ${user.id}`);
      const { data: existing, error: checkError } = await supabase
        .from('user_shelf_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('shelf_id', shelfId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        toast({ title: "Already added", description: "This book is already on that shelf." });
        return;
      }

      const { error: insertError } = await supabase
        .from("user_shelf_books")
        .insert({ user_id: user.id, shelf_id: shelfId, book_id: bookId });

      if (insertError) throw insertError;

      toast({ title: "Book added", description: "Successfully added to the shelf." });
    } catch (error: any) {
      console.error("Error adding book to shelf:", error);
      toast({ title: "Error", description: `Could not add book to shelf: ${error.message}`, variant: "destructive" });
    }
  };

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
  
  if (!user?.id) {
    console.log("BookshelfCarousel: Waiting for user ID before rendering cards...");
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        <Skeleton className="h-52 w-36 rounded-2xl flex-shrink-0" />
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

  // Log the user object right before rendering the Carousel
  console.log("BookshelfCarousel: About to render Carousel, user object:", user);

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
              userId={user.id}
              customShelves={customShelves}
              onRemoveBook={handleRemoveBook}
              onAddBookToShelf={handleAddBookToShelf}
              isDnaBook={false}
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
