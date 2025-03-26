

import React from "react";
import { Star } from "lucide-react";

// Mock data for now - would be replaced with real favorites from user data
const mockIcons = [
  {
    id: "1",
    name: "Virgil",
    role: "Poet & Guide",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "2",
    name: "Plato",
    role: "Philosopher",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "3",
    name: "Nietzsche",
    role: "Philosopher",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "4",
    name: "Socrates",
    role: "Philosopher",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
];

const IconsList: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockIcons.map((icon) => (
        <div key={icon.id} className="w-full cursor-pointer group">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
            <img
              src={icon.image}
              alt={icon.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <h4 className="text-white text-sm font-baskerville drop-shadow-lg line-clamp-2">
                {icon.name}
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

export default IconsList;
