import React, { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isBookReady, setIsBookReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize book
  useEffect(() => {
    if (!book) return;

    const initializeBook = async () => {
      try {
        // First, ensure the book is ready
        await book.ready;
        
        // Wait for the book to be opened
        await book.opened;
        
        // Then load all necessary book components sequentially
        await Promise.all([
          book.loaded.metadata,
          book.loaded.spine,
          book.loaded.manifest,
          book.loaded.cover,
          book.loaded.resources,
          book.loaded.navigation
        ]);

        // Generate locations if needed
        if (!book.locations.length()) {
          await book.locations.generate(1024);
        }

        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
        setIsBookReady(false);
      }
    };

    setIsBookReady(false);
    initializeBook();

    return () => {
      setIsBookReady(false);
    };
  }, [book]);

  // Setup rendition
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
      spread: isMobile ? "none" : "auto",
      minSpreadWidth: 800,
    });

    // Initialize rendition
    const initializeRendition = async () => {
      try {
        await newRendition.display(currentLocation || undefined);
        
        newRendition.on("relocated", (location: any) => {
          if (!isNavigating) {
            onLocationChange(location);
          }
        });

        setRendition(newRendition);
        if (onRenditionReady) {
          onRenditionReady(newRendition);
        }
      } catch (error) {
        console.error('Error initializing rendition:', error);
      }
    };

    initializeRendition();

    // Apply theme and styles
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

    return () => {
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, isBookReady, currentLocation, onRenditionReady]);

  // Handle font size changes
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