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
      if (rendition && typeof rendition.resize === 'function') {
        requestAnimationFrame(() => {
          try {
            rendition.resize(container.clientWidth, container.clientHeight);
          } catch (error) {
            console.error('Error resizing rendition:', error);
          }
        });
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

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize,
  };
};