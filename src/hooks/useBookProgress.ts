import { useState } from "react";
import { Book } from "epubjs";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

    // Calculate chapter pages
    if (currentSpineItem) {
      const chapterHref = currentSpineItem.href;
      const chapterDoc = currentSpineItem.document;
      
      if (chapterDoc) {
        // Calculate total pages in chapter based on content length
        const contentLength = chapterDoc.documentElement.textContent?.length || 0;
        const CHARS_PER_PAGE = 1000; // Approximate characters per page
        const totalPages = Math.max(1, Math.ceil(contentLength / CHARS_PER_PAGE));
        
        // Calculate current page in chapter
        const currentPage = Math.max(1, Math.ceil(location.start.percentage * totalPages));

        setPageInfo(prev => ({
          ...prev,
          chapterCurrent: currentPage,
          chapterTotal: totalPages
        }));
      }
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
    handleLocationChange
  };
};