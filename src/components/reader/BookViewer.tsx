import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";
import type Section from "epubjs/types/section";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import ViewerContainer from "./ViewerContainer";
import SearchDialog from "./SearchDialog";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  textAlign?: 'left' | 'justify' | 'center';
  onRenditionReady?: (rendition: Rendition) => void;
  highlights?: Highlight[];
  onTextSelect?: (cfiRange: string, text: string) => void;
}

const BookViewer = ({ 
  book, 
  currentLocation, 
  onLocationChange, 
  fontSize,
  fontFamily,
  textAlign = 'left',
  onRenditionReady,
  highlights = [],
  onTextSelect
}: BookViewerProps) => {
  const { theme } = useTheme();
  const [isBookReady, setIsBookReady] = useState(false);
  const [isRenditionReady, setIsRenditionReady] = useState(false);
  const [container, setContainer] = useState<Element | null>(null);

  const {
    rendition,
    setRendition,
    setupRendition,
  } = useRenditionSetup(
    book,
    window.innerWidth < 768,
    textAlign,
    fontFamily,
    theme,
    currentLocation,
    onLocationChange,
    onTextSelect,
    highlights
  );

  const {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize,
  } = useReaderResize(rendition);

  const { clearHighlights, reapplyHighlights } = useHighlightManagement(rendition, highlights);

  useEffect(() => {
    const handleRemoveHighlight = (event: CustomEvent) => {
      if (rendition && event.detail?.cfiRange) {
        rendition.annotations.remove(event.detail.cfiRange, "highlight");
      }
    };

    window.addEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    return () => {
      window.removeEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    };
  }, [rendition]);

  useEffect(() => {
    const initializeBook = async () => {
      if (!book) return;
      try {
        await book.ready;
        await book.loaded.spine;
        await book.loaded.navigation;
        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
        setIsBookReady(false);
      }
    };

    initializeBook();
  }, [book]);

  useEffect(() => {
    const epubContainer = document.querySelector(".epub-view");
    if (epubContainer) {
      setContainer(epubContainer);
    }
  }, []);

  useEffect(() => {
    if (!isBookReady || !container || !book) return;

    if (rendition) {
      rendition.destroy();
    }

    const newRendition = setupRendition(container);
    if (!newRendition) return;

    setRendition(newRendition);
    
    newRendition.on("rendered", () => {
      setIsRenditionReady(true);
      if (onRenditionReady) {
        onRenditionReady(newRendition);
      }
      reapplyHighlights();
    });

    const displayLocation = async () => {
      try {
        if (currentLocation) {
          await newRendition.display(currentLocation);
        } else {
          await newRendition.display();
        }
      } catch (error) {
        console.error('Error displaying location:', error);
      }
    };

    displayLocation();

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        debouncedContainerResize(entry.target);
      }
    });

    observer.observe(container);
    setResizeObserver(observer);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (debouncedContainerResize?.cancel) {
        debouncedContainerResize.cancel();
      }
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, isBookReady, container]);

  useFontSizeEffect(rendition, fontSize, highlights, isRenditionReady);

  useEffect(() => {
    if (rendition && isRenditionReady) {
      reapplyHighlights();
    }
  }, [highlights, rendition, isRenditionReady, reapplyHighlights]);

  const handleSearchResultClick = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  const handleSearch = async (query: string): Promise<{ cfi: string; excerpt: string; }[]> => {
    if (!book || !rendition) return [];

    const results: { cfi: string; excerpt: string; }[] = [];
    const spine = book.spine as unknown as { spineItems: Section[] };
    
    if (!spine || !spine.spineItems) {
      console.error('Invalid spine structure:', spine);
      return [];
    }

    try {
      const spineItems = spine.spineItems;
      
      if (spineItems.length === 0) {
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

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <SearchDialog 
          onSearch={handleSearch}
          onResultClick={handleSearchResultClick}
        />
      </div>
      <ViewerContainer theme={theme} />
    </div>
  );
};

export default BookViewer;
