import React from "react";
import { BookOpenText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import ClassicsFavoritesContent from "@/components/bookshelf/favorites/ClassicsFavoritesContent";
import IconsFavoritesContent from "@/components/bookshelf/favorites/IconsFavoritesContent";
import ConceptsFavoritesContent from "@/components/bookshelf/favorites/ConceptsFavoritesContent";
import BackButton from "@/components/navigation/BackButton";

const FavoritesShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStudyClick = () => {
    navigate("/bookshelf");
  };

  return (
    <div className="flex flex-col h-screen bg-[#332E38] text-[#E9E7E2]">
      {/* Header - fixed at top */}
      <div className="flex items-center pt-4 px-4 bg-[#332E38] text-[#E9E7E2] flex-shrink-0 sticky top-0 z-10">
        <BackButton />
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          FAVORITES
        </h2>
        <button 
          onClick={handleStudyClick}
          className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#4A4351]/50"
        >
          <BookOpenText className="h-5 w-5" />
        </button>
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
