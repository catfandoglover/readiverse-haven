import React, { useEffect, useState } from "react";
import type { Book, Rendition } from "epubjs";
import { useTheme } from "@/contexts/ThemeContext";
import type { Highlight } from "@/types/highlight";
import { useRenditionSetup } from "@/hooks/useRenditionSetup";
import { useReaderResize } from "@/hooks/useReaderResize";
import { useFontSizeEffect } from "@/hooks/useFontSizeEffect";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import ViewerContainer from "./ViewerContainer";

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
        
        book.spine.hooks.content.register((contents: any) => {
          const baseUrl = contents.baseUrl || '';
          contents.addStylesheetRules([
            ['img', [
              ['max-width', '100%'],
              ['height', 'auto'],
              ['object-fit', 'contain'],
              ['display', 'none'], // Initially hide images
              ['margin', '0 auto']
            ]],
          ]);

          const preloadImage = (img: HTMLImageElement, src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
              const tempImg = new Image();
              
              tempImg.onload = () => {
                img.src = tempImg.src;
                img.style.display = 'block'; // Show image only after successful load
                resolve();
              };
              
              tempImg.onerror = () => {
                console.error('Failed to load image:', src);
                img.style.display = 'none';
                reject();
              };

              // Handle absolute URLs
              if (src.startsWith('http') || src.startsWith('data:')) {
                tempImg.src = src;
              } else {
                try {
                  tempImg.src = new URL(src, baseUrl).href;
                } catch (error) {
                  console.error('Error creating URL:', error);
                  reject();
                }
              }
            });
          };

          const originalLoad = contents.load.bind(contents);
          contents.load = async function(url: string) {
            try {
              const result = await originalLoad(url);
              const doc = contents.document;
              
              if (doc) {
                // Properly type the NodeList as HTMLImageElement[]
                const images = Array.from(doc.querySelectorAll('img')).filter((img): img is HTMLImageElement => img instanceof HTMLImageElement);
                
                const imageLoadPromises = images.map(img => {
                  const src = img.getAttribute('src');
                  return src ? preloadImage(img, src) : Promise.resolve();
                });

                // Load all images concurrently
                Promise.allSettled(imageLoadPromises).then(results => {
                  results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                      const img = images[index];
                      if (img) img.style.display = 'none';
                    }
                  });
                });
              }
              return result;
            } catch (error) {
              console.error('Error in content load:', error);
              return originalLoad(url);
            }
          };
        });

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
    }
  }, []);

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
    if (rendition && isRenditionReady) {
      reapplyHighlights();
    }
  }, [highlights, rendition, isRenditionReady, reapplyHighlights]);

  return (
    <ViewerContainer theme={theme} />
  );
};

export default BookViewer;