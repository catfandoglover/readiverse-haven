
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const rafId = useRef<number>();
  const isResizing = useRef(false);
  const resizeTimeout = useRef<NodeJS.Timeout>();

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  const debouncedContainerResize = useCallback(
    debounce((container: Element) => {
      if (!rendition || !container || isResizing.current) return;

      isResizing.current = true;

      // Cancel any existing RAF to prevent stacking
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // Use RAF to batch resize operations
      rafId.current = requestAnimationFrame(() => {
        try {
          const { width, height } = container.getBoundingClientRect();
          
          // Ensure we're not trying to set negative or zero dimensions
          if (width > 0 && height > 0 && rendition && typeof rendition.resize === 'function') {
            rendition.resize(width, height);
            
            // Force relayout if in mobile mode
            if (window.innerWidth < 768) {
              rendition.flow('paginated');
              // Ensure no horizontal scroll on mobile
              const iframe = container.querySelector('iframe');
              if (iframe) {
                const doc = iframe.contentDocument;
                if (doc) {
                  const style = doc.createElement('style');
                  style.textContent = `
                    body { 
                      max-width: 100vw; 
                      overflow-x: hidden; 
                      padding: 0 1rem;
                    }
                    img { 
                      max-width: 100%; 
                      height: auto;
                    }
                  `;
                  doc.head.appendChild(style);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error resizing rendition:', error);
        } finally {
          // Add a small delay before allowing next resize
          setTimeout(() => {
            isResizing.current = false;
          }, 100);
        }
      });
    }, 100),
    [rendition]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current);
    }
    if (debouncedContainerResize?.cancel) {
      debouncedContainerResize.cancel();
    }
    if (debouncedResize?.cancel) {
      debouncedResize.cancel();
    }
    isResizing.current = false;
  }, [resizeObserver, debouncedContainerResize, debouncedResize]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }
      resizeTimeout.current = setTimeout(() => {
        debouncedResize();
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [debouncedResize, cleanup]);

  // Handle orientation change explicitly for mobile
  useEffect(() => {
    const handleOrientationChange = () => {
      if (rendition) {
        setTimeout(() => {
          const container = rendition.manager?.container;
          if (container) {
            debouncedContainerResize(container);
          }
        }, 100);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [rendition, debouncedContainerResize]);

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize
  };
};
