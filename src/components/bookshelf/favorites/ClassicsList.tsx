
import React from "react";
import { Book } from "lucide-react";

// Mock data for classics favorites
const classicsFavorites = [
  { id: 1, title: "The Republic", author: "Plato" },
  { id: 2, title: "Nicomachean Ethics", author: "Aristotle" },
  { id: 3, title: "Meditations", author: "Marcus Aurelius" },
  { id: 4, title: "The Divine Comedy", author: "Dante Alighieri" },
  { id: 5, title: "Paradise Lost", author: "John Milton" },
];

const ClassicsList: React.FC = () => {
  return (
    <div>
      <h3 className="text-[#2A282A] font-semibold mb-4">Your Favorite Classics</h3>
      
      {classicsFavorites.length === 0 ? (
        <div className="text-center py-8">
          <Book className="w-12 h-12 mx-auto text-[#2A282A]/30" />
          <p className="mt-2 text-[#2A282A]/60">No favorites yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classicsFavorites.map((classic) => (
            <div 
              key={classic.id}
              className="bg-white rounded-lg shadow-sm border border-[#2A282A]/10 p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-[#2A282A]">{classic.title}</h4>
              <p className="text-[#2A282A]/70 text-sm">{classic.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassicsList;
