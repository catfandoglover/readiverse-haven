import React, { useEffect, useState } from "react";
import ePub from "epubjs";
import { useToast } from "./ui/use-toast";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import type { ReaderProps } from "@/types/reader";

const Reader = ({ metadata }: ReaderProps) => {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [fontSize, setFontSize] = useState(100);

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const bookData = e.target?.result;
      const newBook = ePub(bookData);
      setBook(newBook);
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

    setRendition(newRendition);
    newRendition.display();

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
            <div className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg" />
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;