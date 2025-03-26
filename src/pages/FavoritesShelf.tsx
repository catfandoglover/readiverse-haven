
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import ClassicsFavoritesContent from "@/components/bookshelf/favorites/ClassicsFavoritesContent";
import IconsFavoritesContent from "@/components/bookshelf/favorites/IconsFavoritesContent";
import ConceptsFavoritesContent from "@/components/bookshelf/favorites/ConceptsFavoritesContent";

const FavoritesShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 pb-12 px-8 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <button 
          onClick={handleBack}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#4A4351]/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          FAVORITES
        </h2>
        {/* Empty div to balance the layout */}
        <div className="w-10"></div>
      </div>
      
      {/* Main Content - using overflow-auto directly */}
      <div className="flex-1 overflow-auto pb-20 px-4">
        {/* Classics */}
        <ClassicsFavoritesContent />
        
        {/* Icons */}
        <IconsFavoritesContent />
        
        {/* Concepts */}
        <ConceptsFavoritesContent />
        
        {/* Added extra padding at the bottom for safe area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default FavoritesShelf;
