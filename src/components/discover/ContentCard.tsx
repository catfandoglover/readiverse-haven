
import React, { useState } from "react";
import { MoreHorizontal, Star, ArrowRight } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  about: string;
  onLearnMore: () => void;
  onImageClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  image,
  title,
  about,
  onLearnMore,
  onImageClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Function to format text with line breaks
  const formatText = (text: string) => {
    if (!text) return "";
    return text.split("\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        className="relative aspect-square w-full" 
        onClick={onImageClick}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-4 right-4 flex gap-2 items-center">
          <button
            className="flex items-center justify-center text-[#2A282A]"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={toggleFavorite}
          >
            <Star 
              className="h-6 w-6" 
              fill={isFavorite ? "#EFFE91" : "#E9E7E2"} 
            />
          </button>
          <button
            className="h-4 w-4 bg-[#E9E7E2] rounded-full flex items-center justify-center text-[#2A282A]"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-6 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col">
        <div className="mb-2">
          <h2 className="text-3xl font-serif mb-4">{title}</h2>
          <p className="text-gray-800 font-baskerville text-lg">{formatText(about)}</p>
        </div>
        
        <div className="py-2 flex items-center justify-start">
          <button
            className="uppercase tracking-wider flex items-center gap-2 font-oxanium text-[#282828]/50 pl-0 font-bold text-sm"
            onClick={onLearnMore}
          >
            LEARN MORE
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#282828]/50 text-[#E9E7E2]">
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
