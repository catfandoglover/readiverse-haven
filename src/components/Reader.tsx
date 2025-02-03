import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderControls from "./reader/ReaderControls";
import BookViewer from "./reader/BookViewer";
import ProgressTracker from "./reader/ProgressTracker";
import FloatingControls from "./reader/FloatingControls";
import BookmarkDialog from "./reader/BookmarkDialog";
import BrightnessOverlay from "./reader/BrightnessOverlay";
import NavigationButtons from "./reader/NavigationButtons";
import TableOfContents from "./reader/TableOfContents";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useNavigation } from "@/hooks/useNavigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useChapterTitle } from "@/hooks/useChapterTitle";
import { useRenditionSettings } from "@/hooks/useRenditionSettings";
import { useHighlights } from "@/hooks/useHighlights";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useLocationPersistence } from "@/hooks/useLocationPersistence";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { NavItem } from "epubjs";
import { useToast } from "@/hooks/use-toast";

interface ReaderProps {
  metadata: {
    coverUrl: string;
    title: string;
    author: string;
  };
  preloadedBookUrl?: string;
  isLoading?: boolean;
}

const Reader = ({ metadata, preloadedBookUrl, isLoading }: ReaderProps) => {
  const [isReading, setIsReading] = useState(false);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [externalLink, setExternalLink] = useState<string | null>(null);

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

  const { toast } = useToast();

  const { handleFileUpload: originalHandleFileUpload, loadBookFromUrl } = useFileHandler(
    setBook,
    setCurrentLocation,
    loadProgress,
    setPageInfo
  );

  const handleFileUpload = async (file: File) => {
    try {
      await originalHandleFileUpload(file);
      toast({
        title: "Book loaded successfully",
        description: `Now reading: ${file.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Please try again with a valid EPUB file",
      });
    }
  };

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
  } = useHighlights(book?.key() || null);

  useEffect(() => {
    setIsReading(!!book);
  }, [book]);

  const sessionTime = useSessionTimer(isReading);
  useLocationPersistence(book, currentLocation);

  useEffect(() => {
    console.log('UseEffect triggered with:', {
      preloadedBookUrl,
      currentBook: book,
      isReading
    });
    
    if (preloadedBookUrl && !book) {
      console.log('Loading book from URL:', preloadedBookUrl);
      loadBookFromUrl(preloadedBookUrl).catch(() => {
        toast({
          variant: "destructive",
          description: "Unable to load the book from URL",
        });
      });
    }
  }, [preloadedBookUrl, loadBookFromUrl, book, isReading, toast]);

  useEffect(() => {
    if (book && currentLocation) {
      const bookKey = book.key();
      const progressKey = `book-progress-${currentLocation}`;
      const progressData = {
        bookId: bookKey,
        position: progress.book,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(progressKey, JSON.stringify(progressData));
      console.log('Stored book progress:', progressData);
    }
  }, [book, currentLocation, progress.book]);

  const handleLocationSelect = async (location: string) => {
    if (!rendition) {
      console.error('Rendition not ready');
      toast({
        variant: "destructive",
        description: "Reader not ready. Please try again.",
      });
      return;
    }

    try {
      console.log('Attempting to display location:', location);
      const container = document.querySelector(".epub-view");
      if (!container) {
        console.error('Container not found');
        return;
      }

      await book?.ready;
      console.log('Book ready, displaying location');
      
      await rendition.display(location);
      console.log('Location displayed successfully');
      
      // Resize after a short delay to ensure content is properly laid out
      setTimeout(() => {
        if (rendition && container) {
          rendition.resize(container.clientWidth, container.clientHeight);
          rendition.display(location);
        }
      }, 100);
    } catch (error) {
      console.error('Error displaying location:', error);
      toast({
        variant: "destructive",
        description: "Unable to navigate to the selected location. Please try again.",
      });
    }
  };

  const handleTextSelect = (cfiRange: string, text: string) => {
    addHighlight(cfiRange, text);
  };

  useEffect(() => {
    if (book) {
      book.loaded.navigation.then(nav => {
        setToc(nav.toc);
      });
    }
  }, [book]);

  const handleTocNavigation = (href: string) => {
    if (rendition) {
      rendition.display(href);
    }
  };

  useEffect(() => {
    const fetchExternalLink = async () => {
      const { data, error } = await supabase
        .from('external_links')
        .select('url')
        .limit(1)
        .maybeSingle();
      
      if (data && !error) {
        setExternalLink(data.url);
      } else {
        console.error('Error fetching external link:', error);
      }
    };

    fetchExternalLink();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg">Loading book...</div>
            </div>
          ) : !book && !preloadedBookUrl ? (
            <div>
              <UploadPrompt onFileUpload={handleFileUpload} />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                {externalLink && (
                  <Button
                    onClick={() => window.open(externalLink, '_blank')}
                    variant="outline"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to Book Cover</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

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
                highlights={highlights}
                selectedHighlightColor={selectedColor}
                onHighlightColorSelect={setSelectedColor}
                onHighlightSelect={handleLocationSelect}
                onRemoveHighlight={removeHighlight}
                toc={toc}
                onNavigate={handleTocNavigation}
              />
              
              <ProgressTracker 
                bookProgress={progress.book}
                pageInfo={pageInfo}
              />

              <div className="relative">
                <NavigationButtons
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
                <div className="fixed md:absolute left-1/2 -translate-x-1/2 top-4 z-50 hidden md:block">
                  <TableOfContents toc={toc} onNavigate={handleTocNavigation} />
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

              <FloatingControls
                currentLocation={currentLocation}
                onLocationSelect={handleLocationSelect}
                onBookmarkClick={handleBookmarkClick}
                highlights={highlights}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                onHighlightSelect={handleLocationSelect}
                onRemoveHighlight={removeHighlight}
              />

              <BookmarkDialog
                open={showBookmarkDialog}
                onOpenChange={setShowBookmarkDialog}
                onRemoveBookmark={handleRemoveBookmark}
                chapterTitle={currentChapterTitle}
              />

              <BrightnessOverlay brightness={brightness} />
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reader;