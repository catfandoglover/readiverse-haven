import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Book, Rendition, Location } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from '@/types/highlight';
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import { useNotes } from "@/hooks/useNotes";
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
import { Textarea } from "@/components/ui/textarea";
import { Copy, Share2, Highlighter, StickyNote } from "lucide-react";

interface BookViewerProps {
  book: Book;
  currentLocation: string | null;
  onLocationChange: (location: any) => void;
  fontSize: number;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
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
  const [noteText, setNoteText] = useState('');
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pendingHighlightRef = useRef<{ cfiRange: string; text: string } | null>(null);
  
  // Use the notes hook
  const bookKey = book?.key() || null;
  const { notes, addNote, removeNote } = useNotes(bookKey);

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

    let currentRendition = rendition;
    
    const cleanup = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (debouncedContainerResize?.cancel) {
        debouncedContainerResize.cancel();
      }
      if (currentRendition) {
        try {
          // Safely destroy the rendition
          if (typeof currentRendition.destroy === 'function') {
            currentRendition.destroy();
          }
        } catch (error) {
          console.error('Error destroying rendition:', error);
        }
      }
    };

    cleanup();

    const newRendition = setupRendition(container);
    if (!newRendition) return;

    setRendition(newRendition);
    currentRendition = newRendition;
    
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

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        debouncedContainerResize(entry.target);
      }
    });

    observer.observe(container);
    setResizeObserver(observer);

    return cleanup;
  }, [book, isMobile, textAlign, fontFamily, theme, isBookReady, container]);

  useFontSizeEffect(rendition, fontSize, highlights, isRenditionReady);

  useEffect(() => {
    if (!rendition || !isRenditionReady) return;
    
    const timeoutId = setTimeout(() => {
      highlights.forEach(highlight => {
        try {
          rendition.annotations.remove(highlight.cfiRange, 'highlight');
          rendition.annotations.add(
            "highlight",
            highlight.cfiRange,
            {},
            undefined,
            `highlight-${highlight.color}`,
            {
              "fill": "#CCFF33",
              "fill-opacity": "0.3",
              "mix-blend-mode": "multiply"
            }
          );
        } catch (error) {
          console.error('Error applying highlight:', error);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [highlights, rendition, isRenditionReady]);

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
        const location = rendition.currentLocation();
        let currentSection: string | undefined;

        // Handle different location types
        if (location && typeof location === 'object') {
          if ('start' in location && location.start && typeof location.start === 'object' && 'cfi' in location.start) {
            currentSection = location.start.cfi as string;
          } else if ('cfi' in location && typeof location.cfi === 'string') {
            currentSection = location.cfi;
          }
        }
        
        if (currentSection) {
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
        }

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

  const saveNote = () => {
    if (!selectedText || !noteText.trim() || !bookKey) return;
    
    console.log('Adding note with:', {
      cfi: selectedText.cfiRange,
      text: selectedText.text,
      note: noteText.trim(),
      bookKey
    });
    
    // Save the note using the useNotes hook
    const newNote = addNote(
      selectedText.cfiRange,
      selectedText.text,
      noteText.trim()
    );
    
    console.log('Note created:', newNote);
    
    if (newNote) {
      toast({
        description: "Note saved successfully",
      });
      
      // Dispatch a custom event so other components can react to note changes
      window.dispatchEvent(new CustomEvent('noteAdded', { 
        detail: { note: newNote } 
      }));
    }
    
    setNoteText('');
    setShowNoteDialog(false);
    setSelectedText(null);
  };

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setContainer(node);
    }
  }, [setContainer]);

  return (
    <div className="w-full h-full relative">
      <ViewerContainer 
        theme={theme} 
        setContainer={handleContainerRef} 
      />

      {/* Selection Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selected Text</DialogTitle>
            <DialogDescription>Choose an action for the selected text.</DialogDescription>
          </DialogHeader>
          <div className="my-2 px-4 py-3 bg-muted rounded-md text-sm">
            {selectedText?.text}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={() => {
                if (selectedText && onTextSelect) {
                  onTextSelect(selectedText.cfiRange, selectedText.text);
                  setSelectedText(null);
                  setShowTextDialog(false);
                  toast({
                    description: "Text highlighted successfully",
                  });
                }
              }}
            >
              <Highlighter className="w-4 h-4 mr-2" /> Highlight
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => {
                setShowTextDialog(false);
                setShowNoteDialog(true);
              }}
            >
              <StickyNote className="w-4 h-4 mr-2" /> Add Note
            </Button>
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={async () => {
                if (selectedText) {
                  try {
                    await navigator.clipboard.writeText(selectedText.text);
                    setSelectedText(null);
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
              }}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={async () => {
                if (selectedText) {
                  try {
                    await navigator.share({
                      text: selectedText.text,
                    });
                    setSelectedText(null);
                    setShowTextDialog(false);
                    toast({
                      description: "Text shared successfully",
                    });
                  } catch (error) {
                    // If share is not supported or user cancels, try copy instead
                    await navigator.clipboard.writeText(selectedText.text);
                    setSelectedText(null);
                    setShowTextDialog(false);
                    toast({
                      description: "Text copied to clipboard",
                    });
                  }
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Write notes or thoughts about this passage.</DialogDescription>
          </DialogHeader>
          <div className="my-2 px-4 py-3 bg-muted rounded-md text-sm">
            {selectedText?.text}
          </div>
          <Textarea 
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your notes here..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNoteText('');
                setShowNoteDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveNote}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookViewer;
