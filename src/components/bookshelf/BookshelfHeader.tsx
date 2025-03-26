
import React from "react";
import { Heart } from "lucide-react";
import MainMenu from "../navigation/MainMenu";
import { Toggle } from "@/components/ui/toggle";

interface BookshelfHeaderProps {
  showFavorites: boolean;
  onToggleFavorites: () => void;
  className?: string;
}

const BookshelfHeader: React.FC<BookshelfHeaderProps> = ({ 
  showFavorites, 
  onToggleFavorites,
  className = ""
}) => {
  return (
    <div className={`flex items-center pt-4 pb-4 px-8 bg-[#332E38] text-[#E9E7E2] ${className}`}>
      <MainMenu />
      <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
        STUDY
      </h2>
      <div>
        <Toggle 
          pressed={showFavorites}
          onPressedChange={onToggleFavorites}
          aria-label="Toggle Favorites"
          className="w-10 h-10 rounded-md text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#4A4351]/50 data-[state=on]:text-[#E9E7E2] data-[state=on]:bg-[#4A4351]/50"
        >
          <Heart className={`h-5 w-5 ${showFavorites ? 'fill-current' : ''}`} />
        </Toggle>
      </div>
    </div>
  );
};

export default BookshelfHeader;
