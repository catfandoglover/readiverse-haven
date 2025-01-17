import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";
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

  // Initialize book
  useEffect(() => {
    const initializeBook = async () => {
      if (!book) return;
      try {
        await book.ready;
        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
        setIsBookReady(false);
      }
    };

    initializeBook();
  }, [book]);

  // Get container reference
  useEffect(() => {
    const epubContainer = document.querySelector(".epub-view");
    if (epubContainer) {
      setContainer(epubContainer);
    }
  }, []);

  // Setup rendition and handle resize
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

    // Setup resize observer
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

  // Handle font size changes and reapply highlights
  useFontSizeEffect(rendition, fontSize, highlights, isRenditionReady);

  // Reapply highlights when they change
  useEffect(() => {
    if (rendition && isRenditionReady) {
      reapplyHighlights();
    }
  }, [highlights, rendition, isRenditionReady, reapplyHighlights]);

  const handleSearch = async (query: string) => {
    if (!book || !rendition) return [];

    const results = [];
    const spine = book.spine.spineItems;

    for (const item of spine) {
      try {
        const chapter = await item.load(book.load.bind(book));
        const text = chapter.textContent || '';
        const matches = text.match(new RegExp(query, 'gi'));

        if (matches) {
          const doc = chapter.document;
          const walker = document.createTreeWalker(
            doc,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: function(node) {
                return node.textContent?.toLowerCase().includes(query.toLowerCase())
                  ? NodeFilter.FILTER_ACCEPT
                  : NodeFilter.FILTER_REJECT;
              }
            }
          );

          let node;
          while ((node = walker.nextNode())) {
            const range = doc.createRange();
            range.selectNodeContents(node);
            
            const cfi = item.cfiFromRange(range);
            
            // Get surrounding context
            const nodeText = node.textContent || '';
            const matchIndex = nodeText.toLowerCase().indexOf(query.toLowerCase());
            const start = Math.max(0, matchIndex - 40);
            const end = Math.min(nodeText.length, matchIndex + query.length + 40);
            const excerpt = '...' + nodeText.slice(start, end) + '...';

            results.push({
              cfi: cfi,
              excerpt: excerpt,
              percentage: item.index / spine.length
            });
          }
        }
      } catch (error) {
        console.error('Error searching chapter:', error);
      }
    }

    return results;
  };

  const handleSearchResultClick = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-50">
        <SearchDialog onSearch={handleSearch} onResultClick={handleSearchResultClick} />
      </div>
      <ViewerContainer theme={theme} />
    </div>
  );
};

export default BookViewer;