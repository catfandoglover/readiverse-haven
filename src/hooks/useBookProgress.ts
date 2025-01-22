import { useState } from "react";
import { Book, Contents } from "epubjs";

interface SpineItem {
  index: number;
  href: string;
  linear: boolean;
  properties: any;
  url: string;
}

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
    localStorage.setItem(`reading-progress-${book.key()}`, cfi);
  };

  const loadProgress = () => {
    if (!book) return null;
    return localStorage.getItem(`reading-progress-${book.key()}`);
  };

  const handleLocationChange = (location: any) => {
    // Early return if location or its required properties are undefined
    if (!location || !location.start) {
      console.warn('Invalid location object received:', location);
      return;
    }

    // If location is a string (like from bookmarks), use it directly
    if (typeof location === 'string') {
      setCurrentLocation(location);
      saveProgress(location);
      return;
    }

    const cfi = location.start.cfi;
    if (!cfi) {
      console.warn('No CFI found in location:', location);
      return;
    }

    setCurrentLocation(cfi);
    saveProgress(cfi);

    if (!book) return;

    // Get current spine item (chapter)
    const currentSpineItem = book.spine.get(cfi);
    
    // Safely access spine items with proper type checking
    const spine = book.spine as unknown as { items: SpineItem[] };
    const spineItems = spine.items || [];
    const spineIndex = currentSpineItem ? spineItems.findIndex(item => item.href === currentSpineItem.href) : 0;
    const totalSpineItems = spineItems.length || 1;

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