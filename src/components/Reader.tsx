import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ReaderProps } from "@/types/reader";
import type { Highlight } from "@/types/highlight";
import UploadPrompt from "@/components/reader/UploadPrompt";
import ReaderControls from "@/components/reader/ReaderControls";
import BookViewer from "@/components/reader/BookViewer";
import ProgressTracker from "@/components/reader/ProgressTracker";
import ThemeSwitcher from "@/components/reader/ThemeSwitcher";
import HighlightsMenu from "@/components/reader/HighlightsMenu";
import NoteDialog from "@/components/reader/NoteDialog";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useNavigation } from "@/hooks/useNavigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useChapterTitle } from "@/hooks/useChapterTitle";
import { useRenditionSettings } from "@/hooks/useRenditionSettings";
import { useHighlights } from "@/hooks/useHighlights";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Reader = ({ metadata }: ReaderProps) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  const {
    book,
    setBook,
    currentLocation,
    setCurrentLocation,
    progress,
    pageInfo,
    setPageInfo,
    loadProgress,
    handleLocationChange,
  } = useBookProgress();

  const { handleFileUpload } = useFileHandler(
    setBook,
    setCurrentLocation,
    loadProgress,
    setPageInfo
  );

  const {
    fontSize,
    fontFamily,
    textAlign,
    brightness,
    rendition,
    handleFontFamilyChange,
    handleFontSizeChange,
    handleBrightnessChange,
    handleRenditionReady,
    setTextAlign
  } = useRenditionSettings();

  const { handlePrevPage, handleNextPage } = useNavigation(rendition);

  const { currentChapterTitle } = useChapterTitle(book, currentLocation, pageInfo);

  const {
    showBookmarkDialog,
    setShowBookmarkDialog,
    handleBookmarkClick,
    handleRemoveBookmark
  } = useBookmarks(book, currentLocation, currentChapterTitle);

  const {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight,
    updateNote
  } = useHighlights(book?.key() || null);

  const handleNoteDialogClose = () => {
    setNoteDialogOpen(false);
    // Clear selected highlight after dialog is fully closed
    setTimeout(() => {
      setSelectedHighlight(null);
    }, 300);
  };

  const handleNoteClick = (highlight: Highlight) => {
    // Set highlight first
    setSelectedHighlight(highlight);
    // Then open dialog
    setNoteDialogOpen(true);
  };

  const handleNoteSave = (note: string) => {
    if (selectedHighlight) {
      updateNote(selectedHighlight.id, note);
    }
    handleNoteDialogClose();
  };

  // Session timer logic
  useEffect(() => {
    if (book) {
      setIsReading(true);
    } else {
      setIsReading(false);
      setSessionTime(0);
    }
  }, [book]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isReading) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isReading]);

  const handleLocationSelect = (location: string) => {
    if (rendition) {
      const container = document.querySelector(".epub-view");
      if (container) {
        rendition.display(location).then(() => {
          setTimeout(() => {
            rendition.resize(container.clientWidth, container.clientHeight);
            rendition.display(location);
          }, 100);
        });
      }
    }
  };

  const handleTextSelect = (cfiRange: string, text: string) => {
    addHighlight(cfiRange, text);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (book && currentLocation) {
        localStorage.setItem(`reading-progress-${book.key()}`, currentLocation);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [book, currentLocation]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {!book ? (
            <UploadPrompt onFileUpload={handleFileUpload} />
          ) : (
            <>
              <ReaderControls
                fontSize={fontSize}
                onFontSizeChange={handleFontSizeChange}
                fontFamily={fontFamily}
                onFontFamilyChange={handleFontFamilyChange}
                textAlign={textAlign}
                onTextAlignChange={setTextAlign}
                brightness={brightness}
                onBrightnessChange={handleBrightnessChange}
                currentLocation={currentLocation}
                onBookmarkClick={handleBookmarkClick}
                onLocationChange={handleLocationSelect}
                sessionTime={sessionTime}
              />
              
              <ProgressTracker 
                bookProgress={progress.book}
                pageInfo={pageInfo}
              />
              <div className="relative">
                <div className="fixed md:absolute left-1 md:-left-16 top-1/2 -translate-y-1/2 z-10">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePrevPage}
                    className="h-6 w-6 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
                  >
                    <ChevronLeft className="h-3 w-3 md:h-5 md:w-5" />
                  </Button>
                </div>
                <div className="fixed md:absolute right-1 md:-right-16 top-1/2 -translate-y-1/2 z-10">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleNextPage}
                    className="h-6 w-6 md:h-10 md:w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
                  >
                    <ChevronRight className="h-3 w-3 md:h-5 md:w-5" />
                  </Button>
                </div>
                <div className="fixed md:absolute right-1 md:-right-16 top-1/4 -translate-y-1/2 z-10">
                  <HighlightsMenu
                    highlights={highlights}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                    onHighlightSelect={handleLocationSelect}
                    onRemoveHighlight={removeHighlight}
                    onUpdateNote={updateNote}
                    onNoteClick={handleNoteClick}
                  />
                </div>
                <BookViewer
                  book={book}
                  currentLocation={currentLocation}
                  onLocationChange={handleLocationChange}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  textAlign={textAlign}
                  onRenditionReady={handleRenditionReady}
                  highlights={highlights}
                  onTextSelect={handleTextSelect}
                />
              </div>
              <ThemeSwitcher />
              <div 
                style={{ 
                  position: 'fixed',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundColor: 'black',
                  opacity: 1 - brightness,
                  zIndex: 50
                }} 
              />

              <AlertDialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove the bookmark from {currentChapterTitle || 'this chapter'}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleRemoveBookmark}
                      aria-label="Remove bookmark"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {selectedHighlight && (
                <NoteDialog
                  open={noteDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      handleNoteDialogClose();
                    }
                  }}
                  onSave={handleNoteSave}
                  initialNote={selectedHighlight.note}
                  highlightedText={selectedHighlight.text}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reader;
