import React, { useEffect, useState } from "react";
import type { ReaderProps } from "@/types/reader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import type Section from "epubjs/types/section";
import type { NavItem } from 'epubjs';
import type { Book } from "epubjs";
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
import SearchDialog from "./reader/SearchDialog";

const Reader = ({ metadata }: ReaderProps) => {
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
  } = useHighlights(book?.key() || null);

  useEffect(() => {
    setIsReading(!!book);
  }, [book]);

  const sessionTime = useSessionTimer(isReading);
  useLocationPersistence(book, currentLocation);

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
        .single();
      
      if (data && !error) {
        setExternalLink(data.url);
      }
    };

    fetchExternalLink();
  }, []);

  const handleSearch = async (query: string): Promise<{ cfi: string; excerpt: string; }[]> => {
    if (!book || !rendition) return [];

    const results: { cfi: string; excerpt: string; }[] = [];
    const spine = book.spine;
    
    if (!spine) {
      console.error('Invalid spine structure:', spine);
      return [];
    }

    try {
      const spineItems = spine.items || [];
      
      if (!Array.isArray(spineItems) || spineItems.length === 0) {
        console.error('No spine items found');
        return [];
      }

      for (const section of spineItems) {
        try {
          if (!section.href) continue;
          
          const content = await book.load(section.href);
          if (!content) continue;

          const text = content.toString().toLowerCase();
          const searchQuery = query.toLowerCase();
          
          let startIndex = 0;
          while (true) {
            const index = text.indexOf(searchQuery, startIndex);
            if (index === -1) break;

            const start = Math.max(0, index - 40);
            const end = Math.min(text.length, index + query.length + 40);
            const excerpt = text.slice(start, end);

            if (section.cfiBase) {
              const cfi = section.cfiBase + "!" + index;
              results.push({ cfi, excerpt });
            }
            
            startIndex = index + 1;
          }
        } catch (error) {
          console.error('Error searching section:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error accessing spine items:', error);
      return [];
    }
  };

  const handleSearchResultClick = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {!book ? (
            <UploadPrompt onFileUpload={handleFileUpload} />
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

              <SearchDialog 
                onSearch={handleSearch}
                onResultClick={handleSearchResultClick}
              />

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