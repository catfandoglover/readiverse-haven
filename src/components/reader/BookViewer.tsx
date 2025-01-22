import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";
import type Section from "epubjs/types/section";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import ViewerContainer from "./ViewerContainer";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [isBookReady, setIsBookReady] = useState(false);
  const [isRenditionReady, setIsRenditionReady] = useState(false);
  const [container, setContainer] = useState<Element | null>(null);

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

  const { clearHighlights, reapplyHighlights } = useHighlightManagement(rendition, highlights);

  useEffect(() => {
    if (!rendition) return;

    const handleTextSelection = (cfiRange: string, contents: any) => {
      try {
        const selection = contents.window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        if (!text || !onTextSelect) return;

        // Create a range to get the selected text
        const range = selection.getRangeAt(0);
        if (!range) return;

        onTextSelect(cfiRange, text);
        toast({
          description: "Text highlighted successfully",
        });

        // Clear the selection after a short delay to allow the iOS menu to close
        setTimeout(() => {
          selection.removeAllRanges();
        }, 100);
      } catch (error) {
        console.error('Error creating highlight:', error);
        toast({
          variant: "destructive",
          description: "Failed to create highlight",
        });
      }
    };

    // Use the epub.js "selected" event which works better with iOS
    rendition.on("selected", handleTextSelection);

    return () => {
      rendition.off("selected", handleTextSelection);
    };
  }, [rendition, onTextSelect]);

  useEffect(() => {
    const initializeBook = async () => {
      if (!book) return;
      try {
        await book.ready;
        await book.loaded.spine;
        await book.loaded.navigation;
        setIsBookReady(true);
      } catch (error) {
        console.error('Error initializing book:', error);
        setIsBookReady(false);
      }
    };

    initializeBook();
  }, [book]);

  useEffect(() => {
    if (!isBookReady || !container || !book) return;

    if (rendition) {
      rendition.destroy();
    }

    const newRendition = setupRendition(container);
    if (!newRendition) return;

    setRendition(newRendition);
    
    newRendition.on("rendered", () => {
      setIsRenditionReady(true);
      if (onRenditionReady) {
        onRenditionReady(newRendition);
      }
      reapplyHighlights();
    });

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
      if (debouncedContainerResize?.cancel) {
        debouncedContainerResize.cancel();
      }
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book, isMobile, textAlign, fontFamily, theme, isBookReady, container]);

  useFontSizeEffect(rendition, fontSize, highlights, isRenditionReady);

  useEffect(() => {
    if (rendition && isRenditionReady) {
      reapplyHighlights();
    }
  }, [highlights, rendition, isRenditionReady, reapplyHighlights]);

  return (
    <div className="relative">
      <ViewerContainer theme={theme} setContainer={setContainer} />
    </div>
  );
};

export default BookViewer;
