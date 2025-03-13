
import React from "react";
import { Brain } from "lucide-react";

// Mock data for concept favorites
const conceptsFavorites = [
  { id: 1, name: "Epistemology", description: "Theory of knowledge" },
  { id: 2, name: "Stoicism", description: "Ancient Greek philosophy" },
  { id: 3, name: "Existentialism", description: "Freedom and responsibility" },
  { id: 4, name: "Teleology", description: "Purpose and design in nature" },
];

const ConceptsList: React.FC = () => {
  return (
    <div>
      <h3 className="text-[#2A282A] font-semibold mb-4">Your Favorite Concepts</h3>
      
      {conceptsFavorites.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-[#2A282A]/30" />
          <p className="mt-2 text-[#2A282A]/60">No favorites yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {conceptsFavorites.map((concept) => (
            <div 
              key={concept.id}
              className="bg-white rounded-lg shadow-sm border border-[#2A282A]/10 p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-[#2A282A]">{concept.name}</h4>
              <p className="text-[#2A282A]/70 text-sm">{concept.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptsList;
