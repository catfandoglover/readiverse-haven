import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  currentLocation: string | null;
  onBookmarkClick: () => void;
}

const BookmarkButton = ({ currentLocation, onBookmarkClick }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = () => {
      if (currentLocation) {
        const bookmarkExists = localStorage.getItem(`book-progress-${currentLocation}`) !== null;
        setIsBookmarked(bookmarkExists);
      }
    };

    checkBookmark();
    window.addEventListener('storage', checkBookmark);
    return () => window.removeEventListener('storage', checkBookmark);
  }, [currentLocation]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onBookmarkClick}
      className="text-red-500 hover:text-red-600"
    >
      <Bookmark 
        className="h-4 w-4" 
        fill={isBookmarked ? "currentColor" : "none"} 
        stroke={isBookmarked ? "currentColor" : "currentColor"}
      />
    </Button>
  );
};

export default BookmarkButton;