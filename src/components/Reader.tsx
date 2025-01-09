import React, { useEffect, useState } from "react";
import ePub from "epubjs";
import { useToast } from "./ui/use-toast";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import BookViewer from "./reader/BookViewer";
import ProgressTracker from "./reader/ProgressTracker";
import type { ReaderProps } from "@/types/reader";
import type { Book } from "epubjs";

const Reader = ({ metadata }: ReaderProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState(100);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    book: 0,
  });
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

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const bookData = e.target?.result;
      const newBook = ePub(bookData);
      setBook(newBook);

      await newBook.locations.generate(1024);
      const totalLocations = newBook.locations.length();
      setPageInfo(prev => ({ ...prev, total: totalLocations }));

      const savedCfi = await loadProgress();
      if (savedCfi) {
        setCurrentLocation(savedCfi);
        toast({
          title: "Progress Restored",
          description: "Returning to your last reading position",
        });
      }
    };
    reader.readAsArrayBuffer(file);
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

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handlePrevPage = () => {
    if (!book?.rendition) return;
    book.rendition.prev();
  };

  const handleNextPage = () => {
    if (!book?.rendition) return;
    book.rendition.next();
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
  }, [book]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!book ? (
          <UploadPrompt onFileUpload={handleFileUpload} />
        ) : (
          <>
            <ReaderControls
              fontSize={fontSize}
              onFontSizeChange={handleFontSizeChange}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              coverUrl={metadata?.coverUrl}
            />
            <ProgressTracker 
              bookProgress={progress.book}
              pageInfo={pageInfo}
            />
            <BookViewer
              book={book}
              currentLocation={currentLocation}
              onLocationChange={handleLocationChange}
              fontSize={fontSize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;