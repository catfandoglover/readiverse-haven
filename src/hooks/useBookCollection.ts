
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";

export interface Book {
  id: string;
  title: string;
  author?: string;
  cover_url?: string;
  slug?: string;
  epub_file_url?: string;
  category?: string[];
}

export const useBookCollection = (category?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-books", user?.Uid, category],
    queryFn: async () => {
      if (!user?.Uid) return [];

      // Get books for this user from the user_books table
      const { data: userBooks, error: userBooksError } = await supabase
        .from("user_books")
        .select("book_id")
        .eq("outseta_user_id", user.Uid);

      if (userBooksError) {
        console.error("Error fetching user books:", userBooksError);
        return [];
      }

      if (!userBooks || userBooks.length === 0) {
        return [];
      }

      const bookIds = userBooks.map(item => item.book_id);

      // Build the query for fetching book details
      let query = supabase
        .from("books")
        .select("id, title, author, cover_url, slug, epub_file_url, categories")
        .in("id", bookIds);

      // If category is specified, filter by category
      if (category) {
        // Filter books where the categories array contains the specified category
        query = query.contains('categories', [category]);
      }

      const { data: books, error: booksError } = await query;

      if (booksError) {
        console.error("Error fetching books:", booksError);
        return [];
      }

      return books || [];
    },
    enabled: !!user?.Uid,
  });
};

export const useFavoriteBooks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorite-books", user?.Uid],
    queryFn: async () => {
      if (!user?.Uid) return [];

      // Get favorite books for this user
      const { data: favorites, error: favoritesError } = await supabase
        .from("user_favorites")
        .select("item_id")
        .eq("outseta_user_id", user.Uid)
        .eq("item_type", "book");

      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError);
        return [];
      }

      if (!favorites || favorites.length === 0) {
        return [];
      }

      const bookIds = favorites.map(item => item.item_id);

      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("id, title, author, cover_url, slug, epub_file_url")
        .in("id", bookIds);

      if (booksError) {
        console.error("Error fetching favorite books:", booksError);
        return [];
      }

      return books || [];
    },
    enabled: !!user?.Uid,
  });
};
