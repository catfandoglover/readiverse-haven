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
      spread: "none"
    });

    if (currentLocation) {
      newRendition.display(currentLocation);
    } else {
      newRendition.display();
    }

    newRendition.on("relocated", (location: any) => {
      onLocationChange(location);
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
  }, [book]); // Only re-run when book changes

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