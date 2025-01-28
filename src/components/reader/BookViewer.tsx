import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Book, Rendition } from "epubjs";
import type Section from "epubjs/types/section";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import ViewerContainer from "./ViewerContainer";
import { useToast } from "@/hooks/use-toast";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface EpubContent {
  document: Document;
}

interface EpubView {
  contents: EpubContent[];
  section?: {
    href: string;
  };
}

interface View {
  contents?: EpubContent | EpubContent[];
  section?: {
    href: string;
  };
}

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
  const [selectedText, setSelectedText] = useState<{
    cfiRange: string;
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });

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

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const MOVE_THRESHOLD = 10;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = Math.abs(touchEnd.x - touchStartRef.current.x);
    const deltaY = Math.abs(touchEnd.y - touchStartRef.current.y);

    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      return;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      return;
    }

    lastTapRef.current = now;
  }, []);

  const handleHighlight = () => {
    if (selectedText && onTextSelect) {
      onTextSelect(selectedText.cfiRange, selectedText.text);
      setSelectedText(null);
      toast({
        description: "Text highlighted successfully",
      });
    }
  };

  useEffect(() => {
    if (!rendition) return;

    const handleTextSelection = (cfiRange: string, contents: any) => {
      try {
        const selection = contents.window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        if (!text) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectedText({ 
          cfiRange, 
          text,
          x: rect.left + (rect.width / 2),
          y: rect.top
        });

      } catch (error) {
        console.error('Error handling text selection:', error);
        toast({
          variant: "destructive",
          description: "Failed to process text selection",
        });
      }
    };

    rendition.on("selected", handleTextSelection);

    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      rendition.off("selected", handleTextSelection);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [rendition, container, handleTouchStart, handleTouchEnd, toast]);

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
    if (!rendition || !isRenditionReady) return;
    
    const timeoutId = setTimeout(() => {
      reapplyHighlights();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [highlights, rendition, isRenditionReady, reapplyHighlights]);

  const handleContextMenuClose = () => {
    if (selectedText) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      setSelectedText(null);
    }
  };

  return (
    <div className="relative">
      <ContextMenu onOpenChange={handleContextMenuClose}>
        <ContextMenuTrigger>
          <ViewerContainer theme={theme} setContainer={setContainer} />
        </ContextMenuTrigger>
        {selectedText && (
          <ContextMenuContent>
            <ContextMenuItem onClick={handleHighlight}>
              Highlight
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
};

export default BookViewer;