import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const rafIdRef = useRef<number>();
  const containerRef = useRef<Element | null>(null);

  const debouncedResize = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250),
    []
  );

  const debouncedContainerResize = useCallback(
    debounce((container: Element) => {
      if (!rendition || !container) return;

      // Cancel any existing rAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Store container reference
      containerRef.current = container;

      // Schedule new update
      rafIdRef.current = requestAnimationFrame(() => {
        try {
          if (rendition && containerRef.current && typeof rendition.resize === 'function') {
            rendition.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
          }
        } catch (error) {
          console.warn('Non-critical resize error:', error);
        } finally {
          rafIdRef.current = undefined;
        }
      });
    }, 250),
    [rendition]
  );

  useEffect(() => {
    const handleResize = () => debouncedResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedResize.cancel();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [debouncedResize]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      debouncedContainerResize.cancel();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [resizeObserver, debouncedContainerResize]);

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize,
  };
};