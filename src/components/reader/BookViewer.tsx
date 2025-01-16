import React, { useEffect, useState, useCallback } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import { debounce } from "lodash";
import { Highlight } from "@/types/highlight";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  textAlign?: 'left' | 'justify' | 'center';
  onRenditionReady?: (rendition: Rendition) => void;
  highlights?: Highlight[];
  onCreateHighlight?: (cfi: string, text: string, chapterInfo?: string) => void;
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
  onCreateHighlight
}: BookViewerProps) => {
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("Unknown Chapter");

  // Debounced resize handler for window resize
  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  // Debounced container resize handler
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
      ".highlight-yellow": {
        "background-color": "rgba(255, 255, 0, 0.3)",
      },
      ".highlight-green": {
        "background-color": "rgba(0, 255, 0, 0.3)",
      },
      ".highlight-blue": {
        "background-color": "rgba(0, 0, 255, 0.3)",
      },
      ".highlight-pink": {
        "background-color": "rgba(255, 192, 203, 0.3)",
      }
    });

    // Add highlight handling
    newRendition.on("selected", (cfiRange: string, contents: any) => {
      const selection = contents.window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && onCreateHighlight) {
        contents.window.getSelection()?.removeAllRanges();
        onCreateHighlight(cfiRange, text, currentChapterTitle);
      }
    });

    // Apply existing highlights
    highlights.forEach(highlight => {
      newRendition.annotations.add(
        "highlight",
        highlight.cfi,
        {},
        undefined,
        `highlight-${highlight.color}`,
        {
          fill: highlight.color,
          "fill-opacity": "0.3",
        }
      );
    });

    // Update chapter title when location changes
    newRendition.on("locationChanged", (location: any) => {
      if (location && location.start) {
        const spineItem = book.spine.get(location.start.cfi);
        if (spineItem) {
          spineItem.load(book.load.bind(book)).then((doc: any) => {
            const title = doc.title || "Unknown Chapter";
            setCurrentChapterTitle(title);
            window.dispatchEvent(new CustomEvent('chapterTitleChange', { 
              detail: { title } 
            }));
          });
        }
      }
    });

    setRendition(newRendition);
    if (onRenditionReady) {
      onRenditionReady(newRendition);
    }

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
  }, [book, isMobile, textAlign, fontFamily, theme, highlights]);

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