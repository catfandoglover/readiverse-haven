import { useEffect, useCallback } from "react";
import type { Rendition } from "epubjs";

export const useNavigation = (rendition: Rendition | null) => {
  const handlePrevPage = useCallback(async () => {
    if (!rendition) return;
    try {
      await rendition.prev();
    } catch (error) {
      console.error('Error navigating to previous page:', error);
    }
  }, [rendition]);

  const handleNextPage = useCallback(async () => {
    if (!rendition) return;
    try {
      await rendition.next();
    } catch (error) {
      console.error('Error navigating to next page:', error);
    }
  }, [rendition]);

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        await handlePrevPage();
      } else if (e.key === "ArrowRight") {
        await handleNextPage();
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