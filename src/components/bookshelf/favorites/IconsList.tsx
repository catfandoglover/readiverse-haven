
import React from "react";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockIcons.map((icon) => (
        <div key={icon.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative">
            <AspectRatio ratio={1}>
              <img
                src={icon.image}
                alt={icon.name}
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
            <h3 className="font-serif text-lg font-medium">{icon.name}</h3>
            <p className="text-sm text-gray-600">{icon.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IconsList;
