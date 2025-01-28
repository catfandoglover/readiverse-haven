import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import ViewerContainer from "./ViewerContainer";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Highlighter } from "lucide-react";

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
  } | null>(null);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pendingHighlightRef = useRef<{ cfiRange: string; text: string } | null>(null);

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
    undefined, // We'll handle text selection separately
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

  const handleHighlightText = () => {
    if (selectedText && onTextSelect) {
      onTextSelect(selectedText.cfiRange, selectedText.text);
      clearSelection();
      setShowTextDialog(false);
      toast({
        description: "Text highlighted successfully",
      });
    }
  };

  const handleCopyText = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText.text);
        clearSelection();
        setShowTextDialog(false);
        toast({
          description: "Text copied to clipboard",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Failed to copy text",
        });
      }
    }
  };

  const handleShareText = async () => {
    if (selectedText) {
      try {
        await navigator.share({
          text: selectedText.text,
        });
        clearSelection();
        setShowTextDialog(false);
        toast({
          description: "Text shared successfully",
        });
      } catch (error) {
        // If share is not supported or user cancels, try copy instead
        handleCopyText();
      }
    }
  };

  const clearSelection = () => {
    setSelectedText(null);
    if (rendition) {
      const contents = rendition.getContents();
      if (Array.isArray(contents)) {
        contents.forEach(content => {
          if (content.window?.getSelection) {
            content.window.getSelection()?.removeAllRanges();
          }
        });
      }
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

        setSelectedText({ cfiRange, text });
        setShowTextDialog(true);
      } catch (error) {
        console.error('Error handling text selection:', error);
        toast({
          variant: "destructive",
          description: "Failed to process text selection",
        });
      }
    };

    rendition.on("selected", handleTextSelection);

    return () => {
      rendition.off("selected", handleTextSelection);
    };
  }, [rendition, toast]);

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

  useEffect(() => {
    if (!rendition || !isRenditionReady) return;
    
    const handleRemoveHighlight = (event: CustomEvent) => {
      const { cfiRange } = event.detail;
      if (!cfiRange || !rendition) return;

      try {
        // First remove the annotation
        rendition.annotations.remove(cfiRange, 'highlight');

        // Get all contents and remove highlight elements
        const contents = rendition.getContents();
        if (Array.isArray(contents)) {
          contents.forEach(content => {
            if (content?.document) {
              // Find and remove the specific highlight element
              const highlights = content.document.querySelectorAll(`[data-epubcfi="${cfiRange}"]`);
              highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                if (parent) {
                  // Instead of removing the element, unwrap it to preserve text
                  while (highlight.firstChild) {
                    parent.insertBefore(highlight.firstChild, highlight);
                  }
                  parent.removeChild(highlight);
                }
              });
            }
          });
        }

        // Force a redraw of the current section
        const currentSection = rendition.currentLocation().start.cfi;
        rendition.display(currentSection).then(() => {
          // After redraw, reapply remaining highlights
          highlights.forEach(h => {
            if (h.cfiRange !== cfiRange) {
              rendition.annotations.add(
                "highlight",
                h.cfiRange,
                {},
                undefined,
                `highlight-${h.color}`,
                {
                  "fill": h.color,
                  "fill-opacity": "0.3",
                  "mix-blend-mode": "multiply"
                }
              );
            }
          });
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
  }, [rendition, isRenditionReady, toast, highlights]);

  return (
    <div className="relative">
      <ViewerContainer theme={theme} setContainer={setContainer} />
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Text Options</DialogTitle>
            <DialogDescription>
              Choose what you'd like to do with the selected text:
              <div className="mt-2 p-4 bg-muted rounded-md">
                {selectedText?.text}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleHighlightText}
            >
              <Highlighter className="h-4 w-4" />
              Highlight
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleCopyText}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleShareText}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookViewer;
