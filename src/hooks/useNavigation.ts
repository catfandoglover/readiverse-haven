import { useEffect } from "react";
import type { Rendition } from "epubjs";

export const useNavigation = (rendition: Rendition | null) => {
  const handlePrevPage = () => {
    if (rendition) {
      rendition.prev().catch(error => {
        console.error('Error navigating to previous page:', error);
      });
    }
  };

  const handleNextPage = () => {
    if (rendition) {
      rendition.next().catch(error => {
        console.error('Error navigating to next page:', error);
      });
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

    window.addEventListener("keyup", handleKeyPress);
    return () => window.removeEventListener("keyup", handleKeyPress);
  }, [rendition]);

  return {
    handlePrevPage,
    handleNextPage
  };
};