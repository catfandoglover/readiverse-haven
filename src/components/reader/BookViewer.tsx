import React, { useEffect, useState, useCallback } from "react";
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
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const [isBookReady, setIsBookReady] = useState(false);

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  const debouncedContainerResize = useCallback(
    debounce((container: Element) => {
      if (rendition && typeof rendition.resize === 'function') {
        try {
          rendition.resize(container.clientWidth, container.clientHeight);
        } catch (error) {
          console.error('Error resizing rendition:', error);
        }
      }
    }, 250),
    [rendition]
  );

  useEffect(() => {
    const handleResize = () => debouncedResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  useEffect(() => {
    const initializeBook = async () => {
      if (!book) return;
      
      try {
        // Wait for the book to be ready
        await book.ready;
        // Ensure package is loaded
        await book.loaded.package;
        // Ensure spine is loaded
        await book.loaded.spine;
        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
        setIsBookReady(false);
      }
    };

    initializeBook();
  }, [book]);

  useEffect(() => {
    if (!isBookReady || !book) return;

    const container = document.querySelector(".epub-view");
    if (!container) return;

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
      },
      '.highlight-yellow': {
        'background-color': 'rgba(255, 235, 59, 0.3)',
      }
    });

    setRendition(newRendition);
    if (onRenditionReady) {
      onRenditionReady(newRendition);
    }

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

    // Handle text selection
    newRendition.on("selected", (cfiRange: string, contents: any) => {
      const text = contents.window.getSelection()?.toString() || "";
      if (text && onTextSelect) {
        onTextSelect(cfiRange, text);
      }
    });

    // Clear selection when clicking outside
    newRendition.on("click", (event: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString() === "" && onTextSelect) {
        onTextSelect("", "");
      }
    });

    // Apply existing highlights
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

    // Create and setup ResizeObserver
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
      debouncedContainerResize.cancel();
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, highlights, isBookReady]);

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
    <div className="relative">
      <div 
        className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
        style={{ 
          background: theme.background,
          color: theme.text,
        }}
      />
    </div>
  );
};

export default BookViewer;