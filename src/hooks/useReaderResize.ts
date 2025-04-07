import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from "lodash";
import type { Rendition } from "epubjs";

export const useReaderResize = (rendition: Rendition | null) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const rafId = useRef<number>();
  const isResizing = useRef(false);
  const resizeTimeout = useRef<NodeJS.Timeout>();
  const visualViewportRef = useRef<any>(null);

  // Function to get the accurate window dimensions
  const getWindowDimensions = useCallback(() => {
    // Use visualViewport API for Safari if available
    if (window.visualViewport) {
      return {
        width: window.visualViewport.width,
        height: window.visualViewport.height
      };
    }
    
    // Fallback to regular window dimensions
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }, []);

  const debouncedResize = useCallback(
    debounce(() => {
      const { width } = getWindowDimensions();
      setIsMobile(width < 768);
    }, 250),
    [getWindowDimensions]
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
          // Get accurate container dimensions
          const { width, height } = container.getBoundingClientRect();
          
          // For iOS Safari, account for potential viewport issues
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
          
          // Adjust height for iOS Safari if needed
          const adjustedHeight = (isSafari && isIOS) 
            ? Math.min(height, window.visualViewport?.height || height) 
            : height;
          
          if (rendition && typeof rendition.resize === 'function') {
            rendition.resize(width, adjustedHeight);
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
    
    // Remove visualViewport listeners if they exist
    if (visualViewportRef.current && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', visualViewportRef.current);
      visualViewportRef.current = null;
    }
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

    // Set up visualViewport API for better iOS Safari support
    if (window.visualViewport) {
      const handleVisualViewportResize = () => {
        document.documentElement.style.setProperty('--vw-width', `${window.visualViewport.width}px`);
        document.documentElement.style.setProperty('--vw-height', `${window.visualViewport.height}px`);
        handleResize();
      };
      
      // Store reference to the handler for cleanup
      visualViewportRef.current = handleVisualViewportResize;
      
      // Apply initial values
      document.documentElement.style.setProperty('--vw-width', `${window.visualViewport.width}px`);
      document.documentElement.style.setProperty('--vw-height', `${window.visualViewport.height}px`);
      
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      cleanup();
    };
  }, [debouncedResize, cleanup]);

  return {
    isMobile,
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize,
    getWindowDimensions
  };
};