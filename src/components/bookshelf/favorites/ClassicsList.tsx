
import React from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock data for now - would be replaced with real favorites from user data
const mockClassics = [
  {
    id: "1",
    title: "Meditations",
    author: "Marcus Aurelius",
    slug: "meditations"
  },
  {
    id: "2",
    title: "The Republic",
    author: "Plato",
    slug: "the-republic"
  },
  {
    id: "3",
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    slug: "thus-spoke-zarathustra"
  },
];

const ClassicsList: React.FC = () => {
  // Fetch book covers from Supabase
  const { data: books } = useQuery({
    queryKey: ["book-covers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("id, title, slug, cover_url");
      return data || [];
    },
  });

  // Find cover URL by matching slug
  const getCoverUrl = (slug: string) => {
    const book = books?.find(book => book.slug.toLowerCase() === slug.toLowerCase());
    return book?.cover_url || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockClassics.map((classic) => (
        <div key={classic.id} className="w-full cursor-pointer group">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
            <img
              src={getCoverUrl(classic.slug)}
              alt={classic.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <h4 className="text-white text-sm font-baskerville drop-shadow-lg line-clamp-2">
                {classic.title}
              </h4>
            </div>
            <button 
              className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm p-1 rounded-full"
              aria-label="Remove from favorites"
            >
              <Star className="h-5 w-5 text-yellow-400" fill="#EFFE91" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassicsList;
