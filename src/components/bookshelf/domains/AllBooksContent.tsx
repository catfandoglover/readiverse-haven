import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";

const AllBooksContent: React.FC = () => {
  const { user } = useAuth();

  const { data: books, isLoading } = useQuery({
    queryKey: ["all-user-books", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        console.log("Fetching books for user:", user.id);
        
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
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title || "Unknown Title"}
          author={book.author || "Unknown Author"}
          cover_url={book.cover_url}
          slug={book.slug}
          epub_file_url={book.epub_file_url}
        />
      ))}
    </div>
  );
};

export default AllBooksContent;
