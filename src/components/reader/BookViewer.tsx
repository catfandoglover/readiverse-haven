import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import { debounce } from "lodash";
import type { Highlight } from "@/types/highlight";

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
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const [isBookReady, setIsBookReady] = useState(false);

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 1000),
    []
  );

  const handleResize = useCallback((container: Element) => {
    if (!rendition || !container) return;

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      try {
        rendition.resize(container.clientWidth, container.clientHeight);
      } catch (error) {
        console.error('Error resizing rendition:', error);
      }
    }, 100);
  }, [rendition]);

  useEffect(() => {
    const handleWindowResize = () => debouncedResize();
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  useEffect(() => {
    const initializeBook = async () => {
      try {
        await book.ready;
        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
      }
    };

    if (book) {
      initializeBook();
    }

    return () => {
      setIsBookReady(false);
    };
  }, [book]);

  useEffect(() => {
    if (!isBookReady || !containerRef.current) return;

    const container = containerRef.current;
    if (!container || !book) return;

    // Cleanup previous rendition
    if (rendition) {
      try {
        rendition.destroy();
      } catch (error) {
        console.error('Error cleaning up rendition:', error);
      }
    }

    // Create new rendition
    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: isMobile ? "none" : "always",
      minSpreadWidth: 0,
    });

    // Apply themes
    newRendition.themes.default({
      body: {
        "column-count": isMobile ? "1" : "2",
        "column-gap": "2em",
        "column-rule": isMobile ? "none" : "1px solid #e5e7eb",
        padding: "1em",
        "text-align": textAlign,
        "font-family": getFontFamily(fontFamily),
        color: theme.text,
        background: theme.background,
        "pointer-events": "auto",
        "user-select": "text",
      },
      '.highlight-yellow': {
        'background-color': 'rgba(255, 235, 59, 0.3)',
      }
    });

    setRendition(newRendition);
    if (onRenditionReady) {
      onRenditionReady(newRendition);
    }

    // Display content
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

    // Setup text selection handler
    const handleTextSelection = (cfiRange: string, contents: any) => {
      const text = contents.window.getSelection()?.toString() || "";
      if (text && onTextSelect) {
        onTextSelect(cfiRange, text);
        if (contents.window.getSelection()) {
          contents.window.getSelection()?.removeAllRanges();
        }
      }
    };

    newRendition.on("selected", handleTextSelection);

    // Apply highlights
    highlights.forEach(highlight => {
      try {
        newRendition.annotations.add(
          "highlight",
          highlight.cfiRange,
          {},
          undefined,
          "highlight-yellow"
        );
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    });

    // Handle location changes
    newRendition.on("relocated", (location: any) => {
      onLocationChange(location);
      
      const contents = newRendition.getContents();
      if (contents && Array.isArray(contents) && contents.length > 0) {
        const doc = contents[0].document;
        let heading = doc.querySelector('h2 a[id^="link2H_"]');
        if (heading) {
          heading = heading.parentElement;
        } else {
          heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
        }
        const chapterTitle = heading ? heading.textContent?.trim() : "Unknown Chapter";
        window.dispatchEvent(new CustomEvent('chapterTitleChange', { 
          detail: { title: chapterTitle } 
        }));
      }
    });

    // Setup ResizeObserver
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        handleResize(entries[0].target);
      }
    });

    observer.observe(container);
    resizeObserverRef.current = observer;

    // Cleanup function
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (newRendition) {
        newRendition.off("selected", handleTextSelection);
        try {
          newRendition.destroy();
        } catch (error) {
          console.error('Error cleaning up rendition:', error);
        }
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, highlights, isBookReady, handleResize, currentLocation, onLocationChange, onRenditionReady, onTextSelect]);

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  const getFontFamily = (font: 'georgia' | 'helvetica' | 'times') => {
    switch (font) {
      case 'georgia':
        return 'Georgia, serif';
      case 'helvetica':
        return 'Helvetica, Arial, sans-serif';
      case 'times':
        return 'Times New Roman, serif';
      default:
        return 'Georgia, serif';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
      style={{ 
        background: theme.background,
        color: theme.text,
        position: 'relative',
        zIndex: 0,
      }}
    />
  );
};

export default BookViewer;