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
  const [isSelecting, setIsSelecting] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

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
    const handleRemoveHighlight = (event: CustomEvent) => {
      if (rendition && event.detail?.cfiRange) {
        rendition.annotations.remove(event.detail.cfiRange, "highlight");
      }
    };

    window.addEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    return () => {
      window.removeEventListener('removeHighlight', handleRemoveHighlight as EventListener);
    };
  }, [rendition]);

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
    const epubContainer = document.querySelector(".epub-view");
    if (epubContainer) {
      setContainer(epubContainer);

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        setTouchStartTime(Date.now());
        setTouchStartX(touch.clientX);
        setTouchStartY(touch.clientY);
        setIsSelecting(false);
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        const timeDiff = Date.now() - touchStartTime;

        // If the user has been touching for more than 500ms and hasn't moved much horizontally
        if (timeDiff > 500 && deltaX < 20) {
          setIsSelecting(true);
          // Prevent scrolling while selecting text
          if (isSelecting) {
            e.preventDefault();
          }
        }
      };

      const handleTouchEnd = () => {
        if (isSelecting && rendition) {
          const contents = rendition.getContents();
          if (!contents) return;

          // Handle contents as an array or single item
          const contentsArray = Array.isArray(contents) ? contents : [contents];
          
          contentsArray.forEach(content => {
            if (!content?.window?.getSelection) return;
            
            const selection = content.window.getSelection();
            if (selection && selection.toString().trim()) {
              try {
                const range = selection.getRangeAt(0);
                const cfi = content.cfiFromRange(range);
                
                if (onTextSelect && cfi) {
                  onTextSelect(cfi, selection.toString().trim());
                  toast({
                    description: "Text highlighted successfully",
                  });
                }
              } catch (error) {
                console.error('Error creating highlight:', error);
                toast({
                  variant: "destructive",
                  description: "Failed to create highlight",
                });
              } finally {
                selection.removeAllRanges();
              }
            }
          });
        }
        setIsSelecting(false);
      };

      epubContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      epubContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
      epubContainer.addEventListener('touchend', handleTouchEnd);

      return () => {
        epubContainer.removeEventListener('touchstart', handleTouchStart);
        epubContainer.removeEventListener('touchmove', handleTouchMove);
        epubContainer.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [container, rendition, onTextSelect, touchStartTime, isSelecting, touchStartX, touchStartY]);

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
      <ViewerContainer theme={theme} />
    </div>
  );
};

export default BookViewer;
