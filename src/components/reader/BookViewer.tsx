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

  const handleSearch = async (query: string) => {
    if (!book || !rendition) return [];
    
    const results = [];
    const spine = book.spine;
    
    for (const item of spine.items) {
      try {
        const contents = await item.load(book.load.bind(book));
        const doc = contents.document;
        const text = doc.body.textContent || '';
        
        // Simple text search (can be enhanced with more sophisticated search)
        const searchText = text.toLowerCase();
        const queryText = query.toLowerCase();
        let index = searchText.indexOf(queryText);
        
        while (index !== -1) {
          // Get surrounding context
          const start = Math.max(0, index - 40);
          const end = Math.min(searchText.length, index + queryText.length + 40);
          const excerpt = text.slice(start, end).trim();
          
          // Get CFI for this location
          const range = doc.createRange();
          range.setStart(doc.body, 0);
          range.setEnd(doc.body, 0);
          const cfi = item.cfiFromRange(range);
          
          results.push({
            cfi,
            excerpt,
            percentage: item.index / spine.items.length
          });
          
          index = searchText.indexOf(queryText, index + 1);
        }
      } catch (error) {
        console.error('Error searching in item:', error);
      }
    }
    
    return results;
  };

  // Initialize book
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

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <SearchDialog
          onSearch={handleSearch}
          onResultClick={(cfi) => {
            if (rendition) {
              rendition.display(cfi);
            }
          }}
        />
      </div>
      <ViewerContainer theme={theme} />
    </div>
  );
};

export default BookViewer;