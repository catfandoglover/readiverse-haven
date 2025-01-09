import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
  onRenditionReady?: (rendition: Rendition) => void;
}

const BookViewer = ({ book, currentLocation, onLocationChange, fontSize, onRenditionReady }: BookViewerProps) => {
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = document.querySelector(".epub-view");
    if (!container || !book) return;

    // Cleanup previous rendition before creating a new one
    if (rendition) {
      rendition.destroy();
    }

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: isMobile ? "none" : "auto",
      minSpreadWidth: 800, // Only show spreads on wider screens
    });

    if (currentLocation) {
      newRendition.display(currentLocation);
    } else {
      newRendition.display();
    }

    newRendition.on("relocated", (location: any) => {
      onLocationChange(location);
    });

    // Apply the column layout based on screen size
    newRendition.themes.default({
      body: {
        "column-count": isMobile ? "1" : "2",
        "column-gap": "2em",
        "column-rule": isMobile ? "none" : "1px solid #e5e7eb",
        padding: "1em",
      }
    });

    setRendition(newRendition);
    if (onRenditionReady) {
      onRenditionReady(newRendition);
    }

    return () => {
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile]); // Re-render when book or screen size changes

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  return (
    <div className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg" />
  );
};

export default BookViewer;