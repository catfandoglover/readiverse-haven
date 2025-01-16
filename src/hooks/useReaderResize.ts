import { useState, useEffect, useCallback } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  const debouncedContainerResize = useCallback(
    debounce((container: Element) => {
      if (!rendition || !container) return;

      // Use rAF to ensure smooth resize handling
      let rafId: number;
      const updateSize = () => {
        try {
          if (rendition && typeof rendition.resize === 'function') {
            rendition.resize(container.clientWidth, container.clientHeight);
          }
        } catch (error) {
          console.error('Error resizing rendition:', error);
        }
      };

      // Cancel any pending rAF
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Schedule new update
      rafId = requestAnimationFrame(updateSize);
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

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize,
  };
};