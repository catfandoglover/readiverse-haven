import React, { useEffect, useState, useCallback } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  textAlign?: 'left' | 'justify' | 'center';
  onRenditionReady?: (rendition: Rendition) => void;
}

const BookViewer = ({ 
  book, 
  currentLocation, 
  onLocationChange, 
  fontSize,
  fontFamily,
  textAlign = 'left',
  onRenditionReady 
}: BookViewerProps) => {
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
  }, []);

  useEffect(() => {
    const handleResize = debouncedResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedResize]);

  useEffect(() => {
    const container = document.querySelector(".epub-view");
    if (!container || !book) return;

    if (rendition) {
      rendition.destroy();
    }

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: isMobile ? "none" : "always",
      minSpreadWidth: 0,
    });

    // Set up rendition before displaying content
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
      }
    });

    // Store rendition reference before displaying content
    setRendition(newRendition);
    if (onRenditionReady) {
      onRenditionReady(newRendition);
    }

    // Display content after rendition is set up
    if (currentLocation) {
      newRendition.display(currentLocation);
    } else {
      newRendition.display();
    }

    newRendition.on("relocated", (location: any) => {
      onLocationChange(location);
      
      // Extract chapter title from the current section
      const contents = newRendition.getContents();
      
      if (contents && Array.isArray(contents) && contents.length > 0) {
        const doc = contents[0].document;
        
        // First try to find the specific heading format
        let heading = doc.querySelector('h2 a[id^="link2H_"]');
        
        if (heading) {
          heading = heading.parentElement;
        } else {
          // Fallback to any heading if specific format not found
          heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
        }
        
        const chapterTitle = heading ? heading.textContent?.trim() : "Unknown Chapter";
        
        // Dispatch a custom event to update the chapter title
        window.dispatchEvent(new CustomEvent('chapterTitleChange', { 
          detail: { title: chapterTitle } 
        }));
      }
    });

    // Use ResizeObserver with proper typing and debouncing
    let resizeTimeout: number | undefined;
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (!entries.length) return;
      
      // Clear any pending resize timeout
      if (resizeTimeout !== undefined) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      
      // Schedule a new resize with proper type checking
      const frameCallback: FrameRequestCallback = () => {
        if (newRendition && typeof newRendition.resize === 'function') {
          try {
            newRendition.resize();
          } catch (error) {
            console.error('Error resizing rendition:', error);
          }
        }
      };
      
      resizeTimeout = window.requestAnimationFrame(frameCallback);
    });

    resizeObserver.observe(container);

    return () => {
      if (resizeTimeout !== undefined) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      resizeObserver.disconnect();
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme]);

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
      className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
      style={{ 
        background: theme.background,
        color: theme.text,
      }}
    />
  );
};

export default BookViewer;