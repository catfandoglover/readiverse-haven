
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
    console.log('Saving progress:', { bookKey, cfi });
    saveReadingProgress(bookKey, progress.book);
    // Also save to localStorage for immediate persistence
    localStorage.setItem(`reading-progress-${bookKey}`, cfi);
  };

  const loadProgress = () => {
    if (!book) return null;
    const bookKey = book.key();
    console.log('Loading progress for book:', bookKey);
    // Try to get from localStorage first
    const savedCfi = localStorage.getItem(`reading-progress-${bookKey}`);
    if (savedCfi) {
      console.log('Found saved position:', savedCfi);
      return savedCfi;
    }
    // Fall back to database storage
    const savedProgress = getReadingProgress(bookKey);
    console.log('Database progress:', savedProgress);
    return savedProgress?.position ? savedProgress.position.toString() : null;
  };

  const handleLocationChange = (location: any) => {
    if (!location) {
      console.warn('Invalid location object received:', location);
      return;
    }

    if (!book) return;

    // Extract the CFI based on the location type
    let cfi: string;
    let percentage = 0;

    if (typeof location === 'string') {
      // Handle string locations (from bookmarks)
      cfi = location;
      // When it's a string location (bookmark/highlight), we need to navigate to it
      if (book.rendition) {
        book.rendition.display(cfi);
      }
    } else if (location.start?.cfi) {
      // Handle normal navigation location objects
      cfi = location.start.cfi;
      percentage = location.start.percentage || 0;
    } else if (location.cfiRange) {
      // Handle highlight location objects
      cfi = location.cfiRange;
      // For highlights, we need to navigate to the location
      if (book.rendition) {
        book.rendition.display(cfi);
      }
    } else {
      console.warn('Unrecognized location format:', location);
      return;
    }

    console.log('Location changed:', { cfi, percentage });
    setCurrentLocation(cfi);
    saveProgress(cfi);

    // Get current spine item (chapter)
    const currentSpineItem = book.spine.get(cfi);
    
    // Safely access spine items with proper type checking
    const spine = book.spine as unknown as { items: SpineItem[] };
    const spineItems = spine.items || [];
    const spineIndex = currentSpineItem ? spineItems.findIndex(item => item.href === currentSpineItem.href) : 0;
    const totalSpineItems = spineItems.length || 1;

    // Calculate overall book progress
    const spineProgress = spineIndex / totalSpineItems;
    const overallProgress = (spineProgress + (percentage / totalSpineItems)) * 100;

    const newProgress = {
      book: Math.min(100, Math.max(0, Math.round(overallProgress)))
    };
    
    setProgress(newProgress);

    // Update page info if available
    if (location.start?.displayed) {
      setPageInfo(prev => ({
        ...prev,
        chapterCurrent: location.start.displayed.page || 1,
        chapterTotal: location.start.displayed.total || 1
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
