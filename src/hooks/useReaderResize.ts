import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const rafId = useRef<number>();
  const isResizing = useRef(false);

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

      // Cancel any existing RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // Schedule new resize operation
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
    }, 250),
    [rendition]
  );

  // Cleanup function to handle observer and RAF
  const cleanup = useCallback(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    if (debouncedContainerResize?.cancel) {
      debouncedContainerResize.cancel();
    }
    if (debouncedResize?.cancel) {
      debouncedResize.cancel();
    }
  }, [resizeObserver, debouncedContainerResize, debouncedResize]);

  useEffect(() => {
    const handleResize = () => debouncedResize();
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
    debouncedContainerResize,
  };
};