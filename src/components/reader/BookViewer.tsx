import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";

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

  // Setup rendition and handle resize
  useEffect(() => {
    if (!isBookReady) return;

    const container = document.querySelector(".epub-view");
    if (!container || !book) return;

    // Cleanup previous rendition
    if (rendition) {
      rendition.destroy();
    }

    // Setup new rendition
    const newRendition = setupRendition(container);
    if (!newRendition) return;

    setRendition(newRendition);
    
    // Wait for rendition to be ready
    newRendition.on("rendered", () => {
      setIsRenditionReady(true);
      if (onRenditionReady) {
        onRenditionReady(newRendition);
      }
    });

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

    // Setup resize observer
    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (const entry of entries) {
          debouncedContainerResize(entry.target);
        }
      });
    });

    observer.observe(container);
    setResizeObserver(observer);

    // Cleanup
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (debouncedContainerResize && debouncedContainerResize.cancel) {
        debouncedContainerResize.cancel();
      }
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, highlights, isBookReady]);

  // Handle font size changes and reapply highlights
  useEffect(() => {
    if (!rendition || !isRenditionReady) return;

    const container = document.querySelector(".epub-view");
    if (!container) return;

    rendition.themes.fontSize(`${fontSize}%`);
    
    // Force a re-render of the current location to ensure highlights are properly positioned
    const currentLoc = rendition.location?.start?.cfi;
    if (currentLoc) {
      rendition.display(currentLoc).then(() => {
        // Clear existing highlights before reapplying
        rendition.annotations.clear();
        
        // Reapply highlights after a short delay to ensure content is fully rendered
        setTimeout(() => {
          highlights.forEach(highlight => {
            try {
              rendition.annotations.add(
                "highlight",
                highlight.cfiRange,
                {},
                undefined,
                "highlight-yellow",
                {
                  "fill": "yellow",
                  "fill-opacity": "0.3",
                  "mix-blend-mode": "multiply"
                }
              );
            } catch (error) {
              console.error('Error reapplying highlight:', error);
            }
          });
        }, 100);
      });
    }
  }, [fontSize, rendition, highlights, isRenditionReady]);

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