import { useState } from "react";
import { Book, Contents } from "epubjs";
import { useLibraryStorage } from "./useLibraryStorage";

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

  const { saveReadingProgress, getReadingProgress } = useLibraryStorage();

  const saveProgress = (cfi: string) => {
    if (!book) return;
    const bookKey = book.key();
    saveReadingProgress(bookKey, progress.book);
  };

  const loadProgress = () => {
    if (!book) return null;
    const bookKey = book.key();
    const savedProgress = getReadingProgress(bookKey);
    return savedProgress?.position ? savedProgress.position.toString() : null;
  };

  const handleLocationChange = (location: any) => {
    const cfi = location.start.cfi;
    setCurrentLocation(cfi);
    saveProgress(cfi);

    if (!book) return;

    // Get current spine item (chapter)
    const currentSpineItem = book.spine.get(location.start.cfi);
    
    // Safely access spine items with proper type checking
    const spine = book.spine as unknown as { items: SpineItem[] };
    const spineItems = spine.items || [];
    const spineIndex = currentSpineItem ? spineItems.findIndex(item => item.href === currentSpineItem.href) : 0;
    const totalSpineItems = spineItems.length || 1;

    // Calculate overall book progress
    const spineProgress = spineIndex / totalSpineItems;
    const locationProgress = location.start.percentage || 0;
    const overallProgress = (spineProgress + (locationProgress / totalSpineItems)) * 100;

    const newProgress = {
      book: Math.min(100, Math.max(0, Math.round(overallProgress)))
    };
    
    setProgress(newProgress);

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