import React, { useState, useEffect } from "react";
import type { Rendition } from "epubjs";
import type { ReaderProps } from "@/types/reader";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import BookViewer from "./reader/BookViewer";
import ProgressTracker from "./reader/ProgressTracker";
import ThemeSwitcher from "./reader/ThemeSwitcher";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useNavigation } from "@/hooks/useNavigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Button } from "./ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const Reader = ({ metadata }: ReaderProps) => {
  const [fontSize, setFontSize] = useState(100);
  const [fontFamily, setFontFamily] = useState<'georgia' | 'helvetica' | 'times'>('georgia');
  const [textAlign, setTextAlign] = useState<'left' | 'justify' | 'center'>('left');
  const [brightness, setBrightness] = useState(1);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("Unknown Chapter");
  const { toast } = useToast();

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

  const { handlePrevPage, handleNextPage } = useNavigation(rendition);

  useEffect(() => {
    let isSubscribed = true;

    const handleBeforeUnload = () => {
      if (book && currentLocation) {
        localStorage.setItem(`reading-progress-${book.key()}`, currentLocation);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      isSubscribed = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [book, currentLocation]);

  const handleFontFamilyChange = (value: 'georgia' | 'helvetica' | 'times') => {
    setFontFamily(value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
  };

  const handleRenditionReady = (newRendition: Rendition) => {
    setRendition(newRendition);
  };

  const handleLocationSelect = (location: string) => {
    if (rendition) {
      const container = document.querySelector(".epub-view");
      if (container) {
        // First display the location
        rendition.display(location).then(() => {
          // Wait a brief moment for the content to be properly laid out
          setTimeout(() => {
            // Force a re-layout with container dimensions
            rendition.resize(container.clientWidth, container.clientHeight);
            // Additional display call to ensure correct page positioning
            rendition.display(location);
          }, 100);
        });
      }
    }
  };

  const handleBookmarkClick = async () => {
    if (!currentLocation || !rendition) return;

    const bookmarkKey = `book-progress-${currentLocation}`;
    const existingBookmark = localStorage.getItem(bookmarkKey);

    if (existingBookmark) {
      setShowBookmarkDialog(true);
    } else {
      try {
        const spineItem = book?.spine?.get(currentLocation);
        const chapterInfo = spineItem?.index !== undefined 
          ? `Chapter ${spineItem.index + 1}: ${currentChapterTitle}`
          : currentChapterTitle;

        const now = new Date();
        
        // Get the current page information from rendition's displayed content
        const contents = rendition.getContents();
        let currentPage = pageInfo.chapterCurrent;
        let totalPages = pageInfo.chapterTotal;
        
        if (contents && contents[0] && contents[0].document) {
          const displayed = contents[0].document.documentElement.dataset.displayed;
          if (displayed) {
            try {
              const displayedInfo = JSON.parse(displayed);
              currentPage = displayedInfo.page || currentPage;
              totalPages = displayedInfo.total || totalPages;
            } catch (e) {
              console.error('Error parsing displayed info:', e);
            }
          }
        }

        const bookmarkData = {
          cfi: currentLocation,
          timestamp: now.getTime(),
          chapterInfo,
          pageInfo: `Page ${currentPage} of ${totalPages}`,
          metadata: {
            created: now.toISOString(),
            formattedDate: format(now, 'PPpp'),
            chapterIndex: spineItem?.index,
            chapterTitle: currentChapterTitle,
            pageNumber: currentPage,
            totalPages: totalPages,
          }
        };

        localStorage.setItem(bookmarkKey, JSON.stringify(bookmarkData));
        window.dispatchEvent(new Event('storage'));
        
        toast({
          description: `Bookmark added: ${chapterInfo} (${format(now, 'PP')})`,
        });
      } catch (error) {
        console.error('Error saving bookmark:', error);
        toast({
          variant: "destructive",
          description: "Failed to save bookmark. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const handleChapterTitleChange = (event: CustomEvent<{ title: string }>) => {
      if (!isSubscribed) return;
      
      if (event.detail.title) {
        const newTitle = event.detail.title.trim();
        if (newTitle && newTitle !== "Unknown Chapter") {
          setCurrentChapterTitle(newTitle);
          
          if (currentLocation) {
            const bookmarkKey = `book-progress-${currentLocation}`;
            const existingBookmark = localStorage.getItem(bookmarkKey);
            if (existingBookmark) {
              try {
                let bookmarkData;
                try {
                  bookmarkData = JSON.parse(existingBookmark);
                } catch {
                  const spineItem = book?.spine?.get(currentLocation);
                  bookmarkData = {
                    cfi: existingBookmark,
                    timestamp: Date.now(),
                    chapterInfo: spineItem?.index !== undefined 
                      ? `Chapter ${spineItem.index + 1}: ${newTitle}`
                      : newTitle,
                    pageInfo: `Page ${pageInfo.chapterCurrent} of ${pageInfo.chapterTotal}`,
                    metadata: {
                      created: new Date().toISOString(),
                      chapterIndex: spineItem?.index,
                      chapterTitle: newTitle,
                      pageNumber: pageInfo.chapterCurrent,
                      totalPages: pageInfo.chapterTotal,
                    }
                  };
                }

                const spineItem = book?.spine?.get(currentLocation);
                const updatedBookmarkData = {
                  ...bookmarkData,
                  chapterInfo: spineItem?.index !== undefined 
                    ? `Chapter ${spineItem.index + 1}: ${newTitle}`
                    : newTitle,
                  pageInfo: `Page ${pageInfo.chapterCurrent} of ${pageInfo.chapterTotal}`,
                  metadata: {
                    ...(bookmarkData.metadata || {}),
                    chapterTitle: newTitle,
                    chapterIndex: spineItem?.index,
                    pageNumber: pageInfo.chapterCurrent,
                    totalPages: pageInfo.chapterTotal,
                  }
                };

                if (isSubscribed) {
                  localStorage.setItem(bookmarkKey, JSON.stringify(updatedBookmarkData));
                  window.dispatchEvent(new Event('storage'));
                }
              } catch (error) {
                console.error('Error updating bookmark metadata:', error);
              }
            }
          }
        }
      }
    };

    window.addEventListener('chapterTitleChange', handleChapterTitleChange as EventListener);
    return () => {
      isSubscribed = false;
      window.removeEventListener('chapterTitleChange', handleChapterTitleChange as EventListener);
    };
  }, [currentLocation, book, pageInfo]);

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
                <BookViewer
                  book={book}
                  currentLocation={currentLocation}
                  onLocationChange={handleLocationChange}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  textAlign={textAlign}
                  onRenditionReady={handleRenditionReady}
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
                      onClick={() => {
                        if (currentLocation) {
                          const bookmarkKey = `book-progress-${currentLocation}`;
                          try {
                            localStorage.removeItem(bookmarkKey);
                            window.dispatchEvent(new Event('storage'));
                            toast({
                              description: "Bookmark removed successfully",
                            });
                          } catch (error) {
                            console.error('Error removing bookmark:', error);
                            toast({
                              variant: "destructive",
                              description: "Failed to remove bookmark. Please try again.",
                            });
                          }
                        }
                        setShowBookmarkDialog(false);
                      }}
                      aria-label="Remove bookmark"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reader;
