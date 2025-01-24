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

interface EpubContent {
  document: Document;
}

interface EpubView {
  contents: EpubContent[];
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

  useEffect(() => {
    const handleRemoveHighlight = async (event: CustomEvent) => {
      if (!rendition) return;
      
      try {
        const { cfiRange } = event.detail;
        
        // Remove the highlight annotation
        rendition.annotations.remove(cfiRange, "highlight");
        
        // Get all current views
        const views = rendition.views() as EpubView[];
        if (!views || !Array.isArray(views)) {
          console.error('No views available');
          return;
        }

        // Iterate through each view to remove highlight elements
        for (const view of views) {
          if (!view || !view.contents) continue;
          
          // Handle both single content and array of contents
          const contents = Array.isArray(view.contents) ? view.contents : [view.contents];
          
          for (const content of contents) {
            if (!content || !content.document) continue;
            
            try {
              // Find and remove highlight elements
              const highlights = content.document.querySelectorAll(`[data-epubcfi="${cfiRange}"]`);
              highlights.forEach(highlight => {
                if (highlight && highlight.parentNode) {
                  highlight.parentNode.removeChild(highlight);
                }
              });

              // Force a re-render of the current view
              if (view.section) {
                await rendition.display(view.section.href);
              }
            } catch (error) {
              console.error('Error removing highlight elements:', error);
            }
          }
        }

        toast({
          description: "Highlight removed successfully",
        });
      } catch (error) {
        console.error('Error removing highlight:', error);
        toast({
          variant: "destructive",
          description: "Failed to remove highlight",
        });
      }
    };

    window.addEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    return () => {
      window.removeEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    };
  }, [rendition, toast]);

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

    // If significant movement, don't process as selection
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      return;
    }

    // Handle double tap
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      return;
    }

    lastTapRef.current = now;
  }, []);

  useEffect(() => {
    if (!rendition) return;

    const handleTextSelection = (cfiRange: string, contents: any) => {
      try {
        const selection = contents.window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        if (!text || !onTextSelect) return;

        if (selectionTimeoutRef.current) {
          clearTimeout(selectionTimeoutRef.current);
        }

        onTextSelect(cfiRange, text);
        toast({
          description: "Text highlighted successfully",
        });

        selectionTimeoutRef.current = setTimeout(() => {
          selection.removeAllRanges();
        }, 250);
      } catch (error) {
        console.error('Error creating highlight:', error);
        toast({
          variant: "destructive",
          description: "Failed to create highlight",
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
  }, [rendition, onTextSelect, container, handleTouchStart, handleTouchEnd, toast]);

  useEffect(() => {
    if (!book) return;
    const initializeBook = async () => {
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

  return (
    <div className="relative">
      <ViewerContainer theme={theme} setContainer={setContainer} />
    </div>
  );
};

export default BookViewer;