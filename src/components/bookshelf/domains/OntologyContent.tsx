
import React from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const OntologyContent: React.FC = () => {
  const { data: books, isLoading } = useQuery({
    queryKey: ["ontology-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, cover_url")
        .ilike('category', '%ontology%');
      
      if (error) {
        console.error("Error fetching ontology books:", error);
        return [];
      }
      
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // If no books from the database, use our fallback
  const displayBooks = books?.length ? books : [
    {
      id: "1",
      title: "Being and Time",
      author: "Martin Heidegger",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "2",
      title: "Metaphysics",
      author: "Aristotle",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "3",
      title: "The Phenomenology of Spirit",
      author: "G.W.F. Hegel",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayBooks.map((book) => (
        <div key={book.id} className="w-full cursor-pointer group">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
            <img
              src={book.cover_url || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png"}
              alt={book.title}
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
      ))}
    </div>
  );
};

export default OntologyContent;
