
import React from "react";
import { Card } from "../ui/card";

interface BookCardProps {
  coverUrl: string | null;
  title: string;
  author?: string | null;
  onClick: () => void;
  onImageClick: (e: React.MouseEvent) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  coverUrl,
  title,
  author,
  onClick,
  onImageClick,
}) => {
  return (
    <div className="flex flex-col h-full" onClick={onClick}>
      <div 
        className="relative aspect-square w-full" 
        onClick={onImageClick}
      >
        <img
          src={coverUrl || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 bg-[#E9E7E2] text-[#2A282A] flex-1 flex flex-col rounded-t-2xl -mt-6 relative z-10">
        <div className="mb-2">
          <div className="mb-4">
            <h2 className="text-3xl font-serif">{title}</h2>
          </div>
          {author && (
            <p className="text-gray-800 font-baskerville text-lg">{author}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
