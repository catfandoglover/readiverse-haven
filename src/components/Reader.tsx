import React from "react";
import type { ReaderProps } from "@/types/reader";
import { supabase } from "@/integrations/supabase/client";
import type Section from "epubjs/types/section";
import type { Book } from "epubjs";
import Spine from "epubjs/types/spine";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderHeader from "./reader/ReaderHeader";
import ReaderContent from "./reader/ReaderContent";
import { useBookProgress } from "@/hooks/useBookProgress";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useNavigation } from "@/hooks/useNavigation";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useChapterTitle } from "@/hooks/useChapterTitle";
import { useRenditionSettings } from "@/hooks/useRenditionSettings";
import { useHighlights } from "@/hooks/useHighlights";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useLocationPersistence } from "@/hooks/useLocationPersistence";
import { useReaderState } from "@/hooks/useReaderState";
import { ThemeProvider } from "@/contexts/ThemeContext";

interface SpineItem {
  href: string;
  cfiBase: string;
  index?: number;
}

interface SearchResult {
  href: string;
  excerpt: string;
  chapterTitle?: string;
  spineIndex?: number;
  cfi?: string;
}

const Reader: React.FC<ReaderProps> = ({ metadata }) => {
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

  const { isReading, toc, externalLink, handleBookLoad } = useReaderState();

  const handleSearchResultClick = async (result: SearchResult) => {
    if (!rendition || !book) {
      console.error('Rendition or book not available');
      return;
    }

    console.log('Navigating with result:', result);

    try {
      // If we have a direct CFI, use it first
      if (result.cfi) {
        console.log('Navigating using CFI:', result.cfi);
        await rendition.display(result.cfi);
        return;
      }

      // Try spine index navigation next
      if (typeof result.spineIndex === 'number') {
        console.log('Navigating using spine index:', result.spineIndex);
        await rendition.display(result.spineIndex);
        return;
      }

      // Fallback to href navigation
      console.log('Attempting href navigation:', result.href);
      const spine = book.spine as unknown as { items: SpineItem[] };
      const spineItem = spine?.items?.find(item => item.href === result.href);

      if (spineItem?.index !== undefined) {
        console.log('Found spine item, navigating to index:', spineItem.index);
        await rendition.display(spineItem.index);
      } else {
        // Last resort: try direct href navigation
        console.log('Attempting direct href navigation');
        await rendition.display(result.href);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    console.log('Starting search for query:', query);
    if (!book || !rendition) {
      console.log('Book or rendition not available');
      return [];
    }

    const results: SearchResult[] = [];
    
    try {
      const spine = book.spine as unknown as { items: SpineItem[] };
      if (!spine || !spine.items || !spine.items.length) {
        console.error('No spine items found');
        return [];
      }

      console.log('Found spine items:', spine.items.length);
      
      for (const item of spine.items) {
        try {
          console.log('Processing spine item:', item.href);
          const content = await book.load(item.href);
          
          if (!content || typeof content !== 'object') {
            console.log('Invalid content for:', item.href);
            continue;
          }

          // Cast content to Document type to access DOM methods
          const doc = content as Document;
          if (!doc.documentElement) {
            console.log('No document element found for:', item.href);
            continue;
          }

          let chapterTitle = "Unknown Chapter";
          const headingElement = doc.documentElement.querySelector('h1, h2, h3, h4, h5, h6');
          if (headingElement) {
            chapterTitle = headingElement.textContent?.trim() || "Unknown Chapter";
          }

          const textContent = doc.documentElement.textContent || '';
          const text = textContent.toLowerCase();
          const searchQuery = query.toLowerCase();
          
          let lastIndex = 0;
          while (true) {
            const index = text.indexOf(searchQuery, lastIndex);
            if (index === -1) break;

            const start = Math.max(0, index - 40);
            const end = Math.min(text.length, index + query.length + 40);
            const excerpt = text.slice(start, end);

            // Generate CFI for this specific match
            try {
              // Access the underlying book object which has the package property
              const bookWithPackage = book as unknown as { package: { cfiFromRange: (range: Range) => string } };
              const range = document.createRange();
              
              // Find the text node containing our match
              const walker = document.createTreeWalker(
                doc.documentElement,
                NodeFilter.SHOW_TEXT,
                null
              );

              let node: Node | null = walker.nextNode();
              let currentPos = 0;

              // Find the text node containing our match
              while (node) {
                const nodeLength = node.textContent?.length || 0;
                if (currentPos + nodeLength > start) {
                  range.setStart(node, start - currentPos);
                  range.setEnd(node, Math.min(end - currentPos, nodeLength));
                  break;
                }
                currentPos += nodeLength;
                node = walker.nextNode();
              }

              if (node && bookWithPackage.package) {
                const cfi = bookWithPackage.package.cfiFromRange(range);
                results.push({
                  href: item.href,
                  excerpt: `...${excerpt}...`,
                  chapterTitle,
                  spineIndex: item.index,
                  cfi
                });
              } else {
                // Fallback without CFI
                results.push({
                  href: item.href,
                  excerpt: `...${excerpt}...`,
                  chapterTitle,
                  spineIndex: item.index
                });
              }
            } catch (cfiError) {
              console.error('Error generating CFI:', cfiError);
              // Fallback without CFI if generation fails
              results.push({
                href: item.href,
                excerpt: `...${excerpt}...`,
                chapterTitle,
                spineIndex: item.index
              });
            }
            
            lastIndex = index + 1;
          }
        } catch (error) {
          console.error('Error processing section:', error);
        }
      }

      console.log('Search completed. Total results:', results.length);
      return results;
    } catch (error) {
      console.error('Error accessing spine items:', error);
      return [];
    }
  };

  React.useEffect(() => {
    handleBookLoad(book);
  }, [book]);

  const sessionTime = useSessionTimer(isReading);
  useLocationPersistence(book, currentLocation);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {!book ? (
            <UploadPrompt onFileUpload={handleFileUpload} />
          ) : (
            <>
              <ReaderHeader
                externalLink={externalLink}
                onSearch={handleSearch}
                onSearchResultClick={handleSearchResultClick}
              />
              <ReaderContent
                book={book}
                fontSize={fontSize}
                fontFamily={fontFamily}
                textAlign={textAlign}
                brightness={brightness}
                currentLocation={currentLocation}
                progress={progress}
                pageInfo={pageInfo}
                sessionTime={sessionTime}
                highlights={highlights}
                selectedColor={selectedColor}
                toc={toc}
                currentChapterTitle={currentChapterTitle}
                showBookmarkDialog={showBookmarkDialog}
                onFontSizeChange={handleFontSizeChange}
                onFontFamilyChange={handleFontFamilyChange}
                onTextAlignChange={setTextAlign}
                onBrightnessChange={handleBrightnessChange}
                onBookmarkClick={handleBookmarkClick}
                onLocationChange={handleLocationChange}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onTocNavigate={href => rendition?.display(href)}
                onRenditionReady={handleRenditionReady}
                onTextSelect={(cfiRange, text) => addHighlight(cfiRange, text)}
                setShowBookmarkDialog={setShowBookmarkDialog}
                handleRemoveBookmark={handleRemoveBookmark}
                setSelectedColor={setSelectedColor}
                removeHighlight={removeHighlight}
              />
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reader;