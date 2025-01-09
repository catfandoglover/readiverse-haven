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

    const currentSpineItem = book.spine.get(location.start.cfi);
    // Access spine items through type assertion
    const spineItems = (book.spine as any).spineItems;
    const spineIndex = spineItems.indexOf(currentSpineItem);
    const totalSpineItems = spineItems.length;

    const spineProgress = spineIndex / totalSpineItems;
    const locationProgress = location.start.percentage || 0;
    const overallProgress = (spineProgress + (locationProgress / totalSpineItems)) * 100;

    setProgress({
      book: Math.min(100, Math.max(0, Math.round(overallProgress)))
    });

    // Calculate pages based on percentage
    const currentPage = Math.ceil((book.locations.length() * location.start.percentage) || 1);
    
    // Type assertion for contents property
    const contents = (currentSpineItem?.contents as any);
    const chapterLength = contents?.length || 0;
    const chapterPages = Math.ceil(chapterLength / 1024) || 1;
    const currentChapterPage = Math.ceil(location.start.percentage * chapterPages);
    
    setPageInfo(prev => ({
      ...prev,
      current: currentPage,
      chapterCurrent: currentChapterPage,
      chapterTotal: chapterPages
    }));
  };

  return {
    book,
    setBook,
    currentLocation,
    setCurrentLocation,
    progress,
    pageInfo,
    loadProgress,
    handleLocationChange
  };
};