import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import BookshelfCarousel from "../BookshelfCarousel";

const ClassicsFavoritesContent: React.FC = () => {
  const { user } = useAuth();
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["classics-favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user's book favorites
      const { data: favoriteBooks, error } = await supabase
        .from("user_favorites")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "book");
        
      if (error) {
        console.error("Error fetching book favorites:", error);
        return null;
      }
      
      if (!favoriteBooks.length) {
        return null;
      }
      
      // Get books data
      const bookIds = favoriteBooks.map(fav => fav.item_id);
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("id, title, author, cover_url, slug, epub_file_url")
        .in("id", bookIds);
        
      if (booksError) {
        console.error("Error fetching books:", booksError);
        return null;
      }
      
      // Return books with user_books fields
      return books.map(book => ({
        ...book,
        book_id: book.id,
      }));
    },
    enabled: !!user?.id,
  });

  // Don't show section if no favorites
  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="font-baskerville text-base font-bold text-[#E9E7E2]">
          CLASSICS
        </h2>
        <p className="font-baskerville text-[#E9E7E2]/50 text-base">
          Your favorite books
        </p>
      </div>
      <BookshelfCarousel 
        queryKey="classics-favorites-carousel" 
        books={favorites} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClassicsFavoritesContent;
