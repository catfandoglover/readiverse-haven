import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
}

const BookViewer = ({ book, currentLocation, onLocationChange, fontSize }: BookViewerProps) => {
  const [rendition, setRendition] = useState<Rendition | null>(null);

  useEffect(() => {
    const container = document.querySelector(".epub-view");
    if (!container || !book) return;

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
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

    return () => {
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, currentLocation]);

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