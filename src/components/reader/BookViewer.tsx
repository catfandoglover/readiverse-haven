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
    const initializeRendition = async () => {
      const container = document.querySelector(".epub-view");
      if (!container || !book) return;

      try {
        // Make sure the book is ready before proceeding
        await book.ready;
        
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

        // Wait for rendition to be ready
        await new Promise<void>((resolve) => {
          newRendition.on("rendered", () => resolve());
          newRendition.on("relocated", onLocationChange);
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
            'background-color': '#FEF7CD',
            'mix-blend-mode': 'multiply'
          },
          '.highlight-green': {
            'background-color': '#F2FCE2',
            'mix-blend-mode': 'multiply'
          },
          '.highlight-blue': {
            'background-color': '#D3E4FD',
            'mix-blend-mode': 'multiply'
          },
          '.highlight-pink': {
            'background-color': '#FFDEE2',
            'mix-blend-mode': 'multiply'
          }
        });

        // Handle text selection
        newRendition.on("selected", (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection()?.toString() || "";
          if (text && onTextSelect) {
            onTextSelect(cfiRange, text);
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
              `highlight-${highlight.color}`
            );
          } catch (error) {
            console.error('Error applying highlight:', error);
          }
        });

        if (onRenditionReady) {
          onRenditionReady(newRendition);
        }

        setRendition(newRendition);

        // Display the content at the correct location
        if (currentLocation) {
          await newRendition.display(currentLocation);
        } else {
          await newRendition.display();
        }

      } catch (error) {
        console.error('Error initializing rendition:', error);
      }
    };

    initializeRendition();

    return () => {
      if (rendition) {
        rendition.destroy();
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