
import React from "react";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Mock data for now - would be replaced with real favorites from user data
const mockConcepts = [
  {
    id: "1",
    title: "Eudaimonia",
    description: "The state of happiness and well-being",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "2",
    title: "Amor Fati",
    description: "Love of fate; acceptance of all life events",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
  {
    id: "3",
    title: "Virtue Ethics",
    description: "Focus on character development and virtues",
    image: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
  },
];

const ConceptsList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockConcepts.map((concept) => (
        <div key={concept.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative">
            <AspectRatio ratio={16/9}>
              <img
                src={concept.image}
                alt={concept.title}
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
            <h3 className="font-serif text-lg font-medium">{concept.title}</h3>
            <p className="text-sm text-gray-600">{concept.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConceptsList;
