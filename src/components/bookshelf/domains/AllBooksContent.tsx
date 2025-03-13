
import React from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AllBooksContent: React.FC = () => {
  const { user } = useAuth();

  const { data: books, isLoading } = useQuery({
    queryKey: ["all-user-books", user?.Uid],
    queryFn: async () => {
      if (!user?.Uid) return [];

      const { data, error } = await supabase
        .from("user_books")
        .select("*, book:books(id, title, author, cover_url)")
        .eq("user_id", user.Uid);

      if (error) {
        console.error("Error fetching all books:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.Uid,
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((userBook) => {
        const book = userBook.book as any;
        return (
          <div key={userBook.id} className="w-full cursor-pointer group">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
              <img
                src={book?.cover_url || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png"}
                alt={book?.title || "Book cover"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button 
                className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm p-1 rounded-full"
                aria-label="Add to favorites"
              >
                <Star className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllBooksContent;
