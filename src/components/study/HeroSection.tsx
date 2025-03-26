
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fallbackCoverUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
  
  const { data: lastBook, isLoading } = useQuery({
    queryKey: ["last-read-book", user?.Uid],
    queryFn: async () => {
      if (!user?.Uid) return null;
      
      // Get the most recently read book for this user
      const { data, error } = await supabase
        .from("user_books")
        .select("book_id, last_read_at, books:book_id(id, title, author, cover_url, slug, epub_file_url)")
        .eq("outseta_user_id", user.Uid)
        .order("last_read_at", { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching last book:", error);
        return null;
      }
      
      return data && data.length > 0 ? data[0].books : null;
    },
    enabled: !!user?.Uid,
  });

  const handleReadBook = () => {
    if (!lastBook) return;
    
    navigate(`/read/${lastBook.slug || lastBook.id}`, {
      state: {
        bookUrl: lastBook.epub_file_url,
        metadata: {
          Cover_super: lastBook.cover_url
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 relative rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Fallback book if none was read
  const displayBook = lastBook || {
    title: "Start Your Reading Journey",
    author: "Pick a book from your bookshelf",
    cover_url: fallbackCoverUrl
  };

  return (
    <div 
      className="w-full h-64 relative rounded-xl overflow-hidden cursor-pointer mb-8"
      onClick={handleReadBook}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${displayBook.cover_url || fallbackCoverUrl})`,
          filter: "blur(1px)",
          transform: "scale(1.03)" 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-2xl font-serif font-semibold line-clamp-1">{displayBook.title}</h2>
        <p className="text-white/80 mt-1">{displayBook.author}</p>
        {lastBook && (
          <div className="mt-3 inline-block">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm py-2 px-4 rounded-full transition-colors">
              Continue Reading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
