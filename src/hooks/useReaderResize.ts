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

      // Clear any existing timeout
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }

      isResizing.current = true;

      // Cancel any existing RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // Schedule new resize operation with a delay
      resizeTimeout.current = setTimeout(() => {
        rafId.current = requestAnimationFrame(() => {
          try {
            if (rendition && typeof rendition.resize === 'function') {
              rendition.resize(container.clientWidth, container.clientHeight);
            }
          } catch (error) {
            console.error('Error resizing rendition:', error);
          } finally {
            isResizing.current = false;
          }
        });
      }, 100);
    }, 250),
    [rendition]
  );

  // Cleanup function to handle observer, RAF, and timeouts
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

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [debouncedResize, cleanup]);

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize
  };
};