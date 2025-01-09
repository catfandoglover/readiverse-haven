import React, { useState } from "react";
import type { Rendition } from "epubjs";
import type { ReaderProps } from "@/types/reader";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import BookViewer from "./reader/BookViewer";
import ProgressTracker from "./reader/ProgressTracker";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useNavigation } from "@/hooks/useNavigation";

const Reader = ({ metadata }: ReaderProps) => {
  const [fontSize, setFontSize] = useState(100);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  
  const {
    book,
    setBook,
    currentLocation,
    setCurrentLocation,
    progress,
    pageInfo,
    setPageInfo,
    loadProgress,
    handleLocationChange
  } = useBookProgress();

  const { handleFileUpload } = useFileHandler(
    setBook,
    setCurrentLocation,
    loadProgress,
    setPageInfo
  );

  const { handlePrevPage, handleNextPage } = useNavigation(rendition);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handleRenditionReady = (newRendition: Rendition) => {
    setRendition(newRendition);
  };

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
              onRenditionReady={handleRenditionReady}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;