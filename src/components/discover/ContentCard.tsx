
import React, { useState } from "react";
import { ArrowRight, Share, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormatText } from "@/hooks/useFormatText";

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
  const isMobile = useIsMobile();
  const { formatText } = useFormatText();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
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
      </div>
      <div 
        className={`p-4 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-3xl relative z-10 ${
          isMobile ? "-mt-16" : "-mt-24"
        }`}
      >
        <div className="mb-1 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-serif truncate pr-2">{title}</h2>
            <div className="flex gap-1 items-center flex-shrink-0">
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
                className="flex items-center justify-center text-[#2A282A]"
                aria-label="Share"
              >
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className={`text-gray-800 font-baskerville text-lg ${isMobile ? "max-h-28 overflow-y-auto" : ""}`}>
            {formatText(about)}
          </div>
        </div>
        
        <div className="py-1 flex items-center justify-start mt-auto">
          <button
            className="uppercase tracking-wider flex items-center gap-1 font-oxanium text-[#282828]/50 pl-0 font-bold text-base"
            onClick={onLearnMore}
          >
            <span className="flex items-center">
              LEARN MORE
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#282828]/50 text-[#E9E7E2] ml-3">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
