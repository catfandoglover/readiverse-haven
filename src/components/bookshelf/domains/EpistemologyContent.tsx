
import React from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock data for epistemology domain resources
const mockEpistemologyResources = [
  {
    id: "1",
    title: "Critique of Pure Reason",
    author: "Immanuel Kant",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "2",
    title: "Meditations on First Philosophy",
    author: "René Descartes",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "3",
    title: "An Essay Concerning Human Understanding",
    author: "John Locke",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
];

const EpistemologyContent: React.FC = () => {
  // Fetch book covers from Supabase (if needed in the future)
  const { data: books } = useQuery({
    queryKey: ["epistemology-books"],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("id, title, author, cover_url")
        .ilike('category', '%epistemology%');
      return data || [];
    },
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockEpistemologyResources.map((resource) => (
        <div key={resource.id} className="w-full cursor-pointer group">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
            <img
              src={resource.cover}
              alt={resource.title}
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

export default EpistemologyContent;
