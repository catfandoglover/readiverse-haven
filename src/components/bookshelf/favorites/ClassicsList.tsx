
import React from "react";
import { Star } from "lucide-react";

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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockClassics.map((classic) => (
        <div key={classic.id} className="w-full cursor-pointer group">
          <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-2">
            <img
              src={classic.cover}
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
          <p className="text-xs text-gray-600">{classic.author}</p>
        </div>
      ))}
    </div>
  );
};

export default ClassicsList;
