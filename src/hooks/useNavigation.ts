
import { useEffect, useState } from "react";
import type { Rendition } from "epubjs";

export const useNavigation = (rendition: Rendition | null) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handlePrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const handleNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      }
    };

    // Add touch event listeners for the entire document
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setTouchStartX(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      // Threshold for swipe detection (adjust as needed)
      const threshold = 50;
      
      if (diff > threshold) {
        handlePrevPage(); // Swipe right to go to previous page
      } else if (diff < -threshold) {
        handleNextPage(); // Swipe left to go to next page
      }
      
      setTouchStartX(null);
    };

    window.addEventListener("keyup", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      window.removeEventListener("keyup", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [rendition, touchStartX]);

  return {
    handlePrevPage,
    handleNextPage
  };
};
