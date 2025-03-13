
import React from "react";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Mock data for now - would be replaced with real favorites from user data
const mockClassics = [
  {
    id: "1",
    title: "Meditations",
    author: "Marcus Aurelius",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "2",
    title: "The Republic",
    author: "Plato",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "3",
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    cover: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
];

const ClassicsList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockClassics.map((classic) => (
        <div key={classic.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative">
            <AspectRatio ratio={3/4}>
              <img
                src={classic.cover}
                alt={classic.title}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            <button 
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
              aria-label="Remove from favorites"
            >
              <Star className="h-5 w-5 text-yellow-400" fill="#EFFE91" />
            </button>
          </div>
          <div className="p-3">
            <h3 className="font-serif text-lg font-medium">{classic.title}</h3>
            <p className="text-sm text-gray-600">{classic.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassicsList;
