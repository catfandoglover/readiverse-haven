
import { useEffect, useCallback } from "react";
import type { Rendition } from "epubjs";

export const useNavigation = (rendition: Rendition | null) => {
  const handlePrevPage = useCallback(() => {
    if (rendition) {
      // Use the prev() method to navigate to the previous page (not chapter)
      rendition.prev();
    }
  }, [rendition]);

  const handleNextPage = useCallback(() => {
    if (rendition) {
      // Use the next() method to navigate to the next page (not chapter)
      rendition.next();
    }
  }, [rendition]);

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
  }, [handlePrevPage, handleNextPage]);

  return {
    handlePrevPage,
    handleNextPage
  };
};
