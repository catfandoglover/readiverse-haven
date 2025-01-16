import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import { debounce } from "lodash";
import type { Highlight } from "@/types/highlight";

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
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  const debouncedRenditionResize = useCallback(
    debounce((width: number, height: number) => {
      if (rendition && typeof rendition.resize === 'function') {
        try {
          rendition.resize(width, height);
        } catch (error) {
          console.error('Error resizing rendition:', error);
        }
      }
    }, 250),
    [rendition]
  );

  useEffect(() => {
    const handleResize = () => debouncedResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  useEffect(() => {
    const initializeBook = async () => {
      if (!book || !containerRef.current) return;

      if (rendition) {
        rendition.destroy();
      }

      const newRendition = book.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
        flow: "paginated",
        spread: isMobile ? "none" : "always",
        minSpreadWidth: 0,
      });

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
          "-webkit-user-select": "text",
          "user-select": "text",
        },
        '.highlight-yellow': {
          'background-color': 'rgba(255, 235, 59, 0.3)',
          cursor: 'pointer'
        }
      });

      // Enhanced text selection handling
      newRendition.on("selected", (cfiRange: string, contents: any) => {
        if (!contents || !onTextSelect) return;
        
        const selection = contents.window.getSelection();
        const text = selection?.toString().trim() || "";
        
        if (text) {
          console.log("Text selected:", text, "CFI Range:", cfiRange);
          onTextSelect(cfiRange, text);
          
          // Apply highlight immediately when text is selected
          try {
            newRendition.annotations.add(
              "highlight",
              cfiRange,
              {},
              undefined,
              "highlight-yellow"
            );
          } catch (error) {
            console.error('Error applying highlight:', error);
          }
        }
      });

      // Clear selection when clicking outside
      newRendition.on("click", (event: any) => {
        if (!event.target || !onTextSelect) return;
        
        // Only clear if we clicked outside text content
        const isTextContent = event.target.nodeType === 3 || 
                            ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(event.target.tagName);
        
        if (!isTextContent) {
          onTextSelect("", "");
        }
      });

      // Apply existing highlights
      highlights.forEach(highlight => {
        try {
          newRendition.annotations.add(
            "highlight",
            highlight.cfiRange,
            {},
            undefined,
            "highlight-yellow"
          );
        } catch (error) {
          console.error('Error applying highlight:', error);
        }
      });

      newRendition.on("relocated", (location: any) => {
        onLocationChange(location);
        
        // Reapply highlights after page change
        highlights.forEach(highlight => {
          try {
            newRendition.annotations.add(
              "highlight",
              highlight.cfiRange,
              {},
              undefined,
              "highlight-yellow"
            );
          } catch (error) {
            console.error('Error reapplying highlight:', error);
          }
        });
        
        const contents = newRendition.getContents();
        if (contents && Array.isArray(contents) && contents.length > 0) {
          const doc = contents[0].document;
          let heading = doc.querySelector('h2 a[id^="link2H_"]');
          if (heading) {
            heading = heading.parentElement;
          } else {
            heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
          }
          const chapterTitle = heading ? heading.textContent?.trim() : "Unknown Chapter";
          window.dispatchEvent(new CustomEvent('chapterTitleChange', { 
            detail: { title: chapterTitle } 
          }));
        }
      });

      try {
        await newRendition.display();
        if (currentLocation) {
          await newRendition.display(currentLocation);
        }
        setRendition(newRendition);
        if (onRenditionReady) {
          onRenditionReady(newRendition);
        }
      } catch (error) {
        console.error('Error displaying book:', error);
      }
    };

    initializeBook();

    // Setup ResizeObserver
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(
        debounce((entries: ResizeObserverEntry[]) => {
          const entry = entries[0];
          if (entry) {
            const { width, height } = entry.contentRect;
            debouncedRenditionResize(width, height);
          }
        }, 250)
      );
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (rendition) {
        rendition.destroy();
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      debouncedRenditionResize.cancel();
    };
  }, [book, isMobile, textAlign, fontFamily, theme, highlights]);

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
    <div className="relative">
      <div 
        ref={containerRef}
        className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
        style={{ 
          background: theme.background,
          color: theme.text,
        }}
      />
    </div>
  );
};

export default BookViewer;