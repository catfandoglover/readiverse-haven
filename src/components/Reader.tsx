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

      // Load saved progress after book is loaded
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

    // Restore previous location if available
    if (currentLocation) {
      newRendition.display(currentLocation);
    } else {
      newRendition.display();
    }

    // Track reading progress
    newRendition.on("relocated", (location: any) => {
      // Save current position
      const cfi = location.start.cfi;
      setCurrentLocation(cfi);
      saveProgress(cfi);

      // Calculate progress
      const currentChapter = book.spine.spineItems.findIndex(
        (item: any) => item.href === location.start.href
      );
      const totalChapters = book.spine.spineItems.length;

      const chapterProgress = Math.round(
        (location.start.percentage || 0) * 100
      );
      const bookProgress = Math.round(
        ((currentChapter + (location.start.percentage || 0)) / totalChapters) * 100
      );

      setProgress({
        chapter: chapterProgress,
        book: bookProgress,
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