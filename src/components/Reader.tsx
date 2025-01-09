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
    chapter: 0,
    book: 0,
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

    let currentChapterId = '';
    let chapterStartPage = 0;
    let currentPage = 0;
    let pagesInCurrentChapter = 0;

    // Function to calculate pages in current chapter
    const calculateChapterPages = async (spineItem: any) => {
      if (!spineItem) return 0;
      const pages = await newRendition.manager.layout.calculatePages(spineItem.href);
      return pages;
    };

    newRendition.on("relocated", async (location: any) => {
      const cfi = location.start.cfi;
      setCurrentLocation(cfi);
      saveProgress(cfi);

      // Get current chapter information
      const currentSpineItem = book.spine.get(location.start.cfi);
      const spineIndex = book.spine.spineItems.indexOf(currentSpineItem);
      const totalSpineItems = book.spine.spineItems.length;
      
      // Check if we've moved to a new chapter
      const newChapterId = currentSpineItem?.idref || '';
      if (currentChapterId !== newChapterId) {
        // We've entered a new chapter
        currentChapterId = newChapterId;
        chapterStartPage = currentPage;
        pagesInCurrentChapter = await calculateChapterPages(currentSpineItem);
        setProgress(prev => ({ ...prev, chapter: 0 }));
      }

      // Update current page
      currentPage = location.start.location;
      
      // Calculate chapter progress
      const pagesIntoChapter = currentPage - chapterStartPage;
      const chapterProgress = Math.round((pagesIntoChapter / Math.max(1, pagesInCurrentChapter)) * 100);
      
      // Calculate book progress
      const bookProgress = Math.round((spineIndex / totalSpineItems) * 100);

      console.log('Progress Update:', {
        chapter: chapterProgress,
        book: bookProgress,
        pagesIntoChapter,
        pagesInCurrentChapter,
        currentPage,
        chapterStartPage,
        spineIndex,
        totalSpineItems
      });

      setProgress({
        chapter: Math.min(100, Math.max(0, chapterProgress)),
        book: Math.min(100, Math.max(0, bookProgress))
      });
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
                <span>Chapter Progress</span>
                <span>{progress.chapter}%</span>
              </div>
              <Progress value={progress.chapter} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Book Progress</span>
                <span>{progress.book}%</span>
              </div>
              <Progress value={progress.book} className="h-2" />
            </div>
            <div className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg" />
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;