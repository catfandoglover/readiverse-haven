
import React from "react";
import { Users } from "lucide-react";

// Mock data for icon favorites
const iconsFavorites = [
  { id: 1, name: "Socrates", description: "Greek philosopher" },
  { id: 2, name: "Augustine", description: "Theologian and philosopher" },
  { id: 3, name: "Galileo", description: "Astronomer and physicist" },
  { id: 4, name: "Marie Curie", description: "Physicist and chemist" },
  { id: 5, name: "Einstein", description: "Theoretical physicist" },
  { id: 6, name: "C.S. Lewis", description: "Author and theologian" },
];

const IconsList: React.FC = () => {
  return (
    <div>
      <h3 className="text-[#2A282A] font-semibold mb-4">Your Favorite Icons</h3>
      
      {iconsFavorites.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-[#2A282A]/30" />
          <p className="mt-2 text-[#2A282A]/60">No favorites yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {iconsFavorites.map((icon) => (
            <div 
              key={icon.id}
              className="bg-white rounded-lg shadow-sm border border-[#2A282A]/10 p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-[#2A282A]">{icon.name}</h4>
              <p className="text-[#2A282A]/70 text-sm">{icon.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconsList;
