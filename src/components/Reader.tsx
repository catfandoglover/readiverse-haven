import React from "react";
import type { ReaderProps } from "@/types/reader";
import { supabase } from "@/integrations/supabase/client";
import type Section from "epubjs/types/section";
import type { Book } from "epubjs";
import Spine from "epubjs/types/spine";
import UploadPrompt from "./reader/UploadPrompt";
import ReaderHeader from "./reader/ReaderHeader";
import MinimalistReaderContent from "./reader/MinimalistReaderContent";
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
import { useToast } from "@/hooks/use-toast";
import { useUpdateReadingStatus } from "@/hooks/useUpdateReadingStatus";
import { VirgilReaderProvider } from "@/contexts/VirgilReaderContext";

interface SpineItem {
  href: string;
  index?: number;
}

interface SearchResult {
  href: string;
  excerpt: string;
  chapterTitle?: string;
  spineIndex?: number;
  location?: string;
  searchText: string;
}

const Reader: React.FC<ReaderProps> = ({ metadata, preloadedBookUrl, isLoading }) => {
  const { toast } = useToast();
  const [showVirgilChat, setShowVirgilChat] = React.useState(false);
  
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

  const { handleFileUpload: originalHandleFileUpload, loadBookFromUrl } = useFileHandler(
    setBook,
    setCurrentLocation,
    loadProgress,
    setPageInfo
  );

  const bookId = React.useMemo(() => {
    if (metadata && 'id' in metadata) {
      return metadata.id as string;
    }
    return null;
  }, [metadata]);

  useUpdateReadingStatus(bookId, currentLocation);

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

  const { isReading, toc, externalLink, handleBookLoad } = useReaderState();

  const findTextInPage = (searchText: string): void => {
    if (!rendition) return;

    const contents = rendition.getContents();
    if (!contents || !contents[0]) return;

    const doc = contents[0].document;
    if (!doc || !doc.body) return;

    const searchTextNode = document.createTextNode(searchText);
    const normalizedSearchText = searchTextNode.textContent?.toLowerCase() || '';

    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null = walker.nextNode();
    while (node) {
      const text = node.textContent?.toLowerCase() || '';
      const index = text.indexOf(normalizedSearchText);
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + normalizedSearchText.length);

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        const element = node.parentElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          const originalColor = element.style.backgroundColor;
          element.style.backgroundColor = 'yellow';
          setTimeout(() => {
            element.style.backgroundColor = originalColor;
          }, 2000);

          break;
        }
      }
      node = walker.nextNode();
    }
  };

  const handleSearchResultClick = async (result: SearchResult) => {
    if (!rendition || !book) {
      console.error('Rendition or book not available');
      return;
    }

    try {
      if (typeof result.spineIndex === 'number') {
        await rendition.display(result.spineIndex);
      } else if (result.href) {
        await rendition.display(result.href);
      } else {
        throw new Error('No valid navigation target');
      }

      rendition.once('rendered', () => {
        findTextInPage(result.searchText);
      });

    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        variant: "destructive",
        description: "Failed to navigate to the search result",
      });
    }
  };

  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    if (!book || !rendition) return [];

    const results: SearchResult[] = [];
    
    try {
      const spine = book.spine as unknown as { items: SpineItem[] };
      if (!spine?.items?.length) return [];

      for (const item of spine.items) {
        try {
          const content = await book.load(item.href);
          if (!content || typeof content !== 'object') continue;

          const doc = content as Document;
          if (!doc.documentElement) continue;

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

            results.push({
              href: item.href,
              excerpt: `...${excerpt}...`,
              chapterTitle,
              spineIndex: item.index,
              searchText: query
            });
            
            lastIndex = index + 1;
          }
        } catch (error) {
          console.error('Error processing section:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error accessing spine items:', error);
      return [];
    }
  };

  React.useEffect(() => {
    if (preloadedBookUrl && !book) {
      loadBookFromUrl(preloadedBookUrl).catch(() => {
        toast({
          variant: "destructive",
          description: "Unable to load the book from URL",
        });
      });
    }
  }, [preloadedBookUrl, loadBookFromUrl, book, toast]);

  React.useEffect(() => {
    handleBookLoad(book);
  }, [book]);

  const sessionTime = useSessionTimer(isReading);
  useLocationPersistence(book, currentLocation);

  const toggleVirgilChat = () => {
    setShowVirgilChat(!showVirgilChat);
  };

  return (
    <VirgilReaderProvider 
      initialTitle={metadata?.title || "Current Book"}
      shouldMoveContent={true}
    >
      <ThemeProvider>
        <div className="min-h-screen bg-[#332E38] transition-colors duration-300">
          <div className="container mx-auto px-0 py-0 max-w-6xl h-screen flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-white">Loading book...</div>
              </div>
            ) : !book && !preloadedBookUrl ? (
              <div>
                <UploadPrompt onFileUpload={handleFileUpload} />
              </div>
            ) : (
              <MinimalistReaderContent
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
                externalLink={metadata?.Cover_super || null}
                onSearch={handleSearch}
                onSearchResultClick={handleSearchResultClick}
                metadata={metadata}
              />
            )}
          </div>
        </div>
      </ThemeProvider>
    </VirgilReaderProvider>
  );
};

export { Reader };
