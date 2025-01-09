import React, { useEffect, useState } from "react";
import ePub from "epubjs";
import { useToast } from "./ui/use-toast";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import { Progress } from "./ui/progress";
import type { ReaderProps } from "@/types/reader";

const Reader = ({ metadata }: ReaderProps) => {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
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

      // Generate page numbers
      await newBook.locations.generate(1024);
      // Get total locations using the length of locations array
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

  const handlePrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const handleNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    if (rendition) {
      rendition.themes.fontSize(`${newSize}%`);
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

  useEffect(() => {
    if (!book) return;

    const container = document.querySelector(".epub-view");
    if (!container) return;

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
    });

    if (currentLocation) {
      newRendition.display(currentLocation);
    } else {
      newRendition.display();
    }

    newRendition.on("relocated", (location: any) => {
      const cfi = location.start.cfi;
      setCurrentLocation(cfi);
      saveProgress(cfi);

      // Get the current spine item and total number of spine items
      const currentSpineItem = book.spine.get(location.start.cfi);
      const spineIndex = book.spine.spineItems.indexOf(currentSpineItem);
      const totalSpineItems = book.spine.spineItems.length;

      // Calculate progress based on spine position and current location
      const spineProgress = spineIndex / totalSpineItems;
      const locationProgress = location.start.percentage || 0;
      const overallProgress = (spineProgress + (locationProgress / totalSpineItems)) * 100;

      setProgress({
        book: Math.min(100, Math.max(0, Math.round(overallProgress)))
      });

      // Calculate current page based on percentage through the book
      const currentPage = Math.ceil((book.locations.length() * location.start.percentage) || 1);
      const chapterPages = Math.ceil(currentSpineItem.length / 1024) || 1;
      const currentChapterPage = Math.ceil(location.start.percentage * chapterPages);
      
      setPageInfo(prev => ({
        ...prev,
        current: currentPage,
        chapterCurrent: currentChapterPage,
        chapterTotal: chapterPages
      }));
    });

    setRendition(newRendition);

    return () => {
      if (newRendition) {
        newRendition.destroy();
      }
    };
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
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Book Progress</span>
                <span>{progress.book}%</span>
              </div>
              <Progress value={progress.book} className="h-2" />
            </div>
            <div className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg" />
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>Page {pageInfo.current} of {pageInfo.total}</span>
              <span>Chapter Page {pageInfo.chapterCurrent} of {pageInfo.chapterTotal}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;
