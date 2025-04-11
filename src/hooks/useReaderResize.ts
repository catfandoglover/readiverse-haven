import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";
import { useVirgilReader } from '@/contexts/VirgilReaderContext';

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const rafId = useRef<number>();
  const isResizing = useRef(false);
  const resizeTimeout = useRef<NodeJS.Timeout>();
  const { showVirgilChat } = useVirgilReader();

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
          if (rendition && typeof rendition.resize === 'function') {
            rendition.resize(width, height);
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

  // Handle resize when window size changes
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

  // Trigger resize when drawer opens/closes
  useEffect(() => {
    if (rendition) {
      // Short delay to allow transition to complete
      setTimeout(() => {
        try {
          // @ts-ignore - Access the rendition container in a safer way
          const container = rendition.manager?.container || rendition.getContents()[0]?.document.defaultView.frameElement.parentNode;
          if (container) {
            debouncedContainerResize(container as Element);
          }
        } catch (error) {
          console.error('Error accessing container for resize:', error);
        }
      }, 350);
    }
  }, [showVirgilChat, debouncedContainerResize, rendition]);

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize
  };
};