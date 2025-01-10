import { useState } from "react";
import { Book } from "epubjs";

export const useBookProgress = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [progress, setProgress] = useState({ book: 0 });
  const [pageInfo, setPageInfo] = useState({
    current: 1,
    total: 0,
    chapterCurrent: 1,
    chapterTotal: 0
  });

  const saveProgress = (cfi: string) => {
    if (!book) return;
    localStorage.setItem(`book-progress-${book.key()}`, cfi);
  };

  const loadProgress = () => {
    if (!book) return null;
    return localStorage.getItem(`book-progress-${book.key()}`);
  };

  const handleLocationChange = (location: any) => {
    const cfi = location.start.cfi;
    setCurrentLocation(cfi);
    saveProgress(cfi);

    if (!book) return;

    // Get current spine item (chapter)
    const currentSpineItem = book.spine.get(location.start.cfi);
    const spineItems = (book.spine as any).spineItems;
    const spineIndex = spineItems.indexOf(currentSpineItem);
    const totalSpineItems = spineItems.length;

    // Calculate overall book progress
    const spineProgress = spineIndex / totalSpineItems;
    const locationProgress = location.start.percentage || 0;
    const overallProgress = (spineProgress + (locationProgress / totalSpineItems)) * 100;

    setProgress({
      book: Math.min(100, Math.max(0, Math.round(overallProgress)))
    });

    // Calculate chapter pages based on the rendition's layout
    if (currentSpineItem && location.start.displayed) {
      const totalPages = location.start.displayed.total || 1;
      const currentPage = location.start.displayed.page || 1;

      setPageInfo(prev => ({
        ...prev,
        chapterCurrent: currentPage,
        chapterTotal: totalPages
      }));
    }
  };

  return {
    book,
    setBook,
    currentLocation,
    setCurrentLocation,
    progress,
    pageInfo,
    setPageInfo,
    loadProgress,
    handleLocationChange,
    saveProgress
  };
};