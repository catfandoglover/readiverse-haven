
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

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
        <button
          className="absolute bottom-4 right-4 h-10 w-10 bg-gray-800/60 rounded-full flex items-center justify-center text-white"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 bg-[#E9E7E2] text-[#2A282A] flex-1">
        <h2 className="text-3xl font-serif mb-4">{title}</h2>
        <h3 className="text-lg uppercase font-bold mb-2">ABOUT</h3>
        <p className="mb-6 text-gray-800">{about}</p>
        <Button
          variant="ghost"
          className="uppercase tracking-wider flex items-center gap-2 text-gray-700 hover:text-gray-900 pl-0"
          onClick={onLearnMore}
        >
          LEARN MORE
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-300">
            →
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ContentCard;
