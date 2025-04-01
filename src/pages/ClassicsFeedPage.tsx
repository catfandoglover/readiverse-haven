import React, { useEffect, useState } from "react";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import ContentCard from "@/components/discover/ContentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  introduction?: string;
  slug?: string;
}

const ClassicsFeedPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data: booksData, error } = await supabase
          .from("books")
          .select("id, title, author, cover_url, introduction, slug")
          .order("randomizer", { ascending: true });

        if (error) {
          console.error("Error fetching books:", error);
        } else {
          setBooks(booksData || []);
        }
      } catch (error) {
        console.error("Exception fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (user?.Uid) {
        try {
          const { data } = await supabase
            .from("user_favorites")
            .select("item_id")
            .eq("outseta_user_id", user.Uid)
            .eq("item_type", "book");

          if (data) {
            setFavorites(data.map((fav) => fav.item_id));
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      }
    };

    fetchBooks();
    fetchFavorites();
  }, [user]);

  const handleCardClick = (book: Book) => {
    if (book.slug) {
      navigate(`/classics/${book.slug}`);
    } else {
      navigate(`/classics/${book.id}`);
    }
  };

  const toggleFavorite = async (bookId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isCurrentlyFavorite = favorites.includes(bookId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("outseta_user_id", user.Uid)
          .eq("item_id", bookId)
          .eq("item_type", "book");

        setFavorites(favorites.filter((id) => id !== bookId));
      } else {
        // Add to favorites
        await supabase.from("user_favorites").insert([
          {
            outseta_user_id: user.Uid,
            item_id: bookId,
            item_type: "book",
          },
        ]);

        setFavorites([...favorites, bookId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <DiscoverLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-6 text-[#E9E7E2] font-libre-baskerville">
          Classics
        </h1>
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {books.map((book) => (
            <ContentCard
              key={book.id}
              title={book.title}
              image={book.cover_url || "/placeholder.svg"}
              description={book.introduction || `by ${book.author}`}
              onClick={() => handleCardClick(book)}
              className="h-full"
              type="Book"
              isFavorite={favorites.includes(book.id)}
              onFavoriteToggle={() => toggleFavorite(book.id)}
            />
          ))}
        </div>
      </div>
    </DiscoverLayout>
  );
};

export default ClassicsFeedPage;
