import React, { useEffect, useRef, useState } from 'react';
import type { Theme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  
  // Effect to update viewport dimensions
  useEffect(() => {
    // Calculate the real viewport height for mobile devices
    const calculateViewportHeight = () => {
      const vh = window.innerHeight;
      setViewportHeight(vh);
      
      // Apply the height to document root as CSS variable
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };
    
    calculateViewportHeight();
    
    // Handle orientation changes and resize events
    const handleResize = () => {
      // Small timeout to ensure dimension changes have completed
      setTimeout(calculateViewportHeight, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
      
      // Add a mutation observer to adjust EPUB content styles
      const observer = new MutationObserver(() => {
        const iframe = containerRef.current?.querySelector('iframe');
        if (iframe) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              // Remove any existing style we might have added before
              const existingStyle = iframeDoc.getElementById('epub-custom-style');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              // Create and add our new style with viewport-aware adjustments
              const style = iframeDoc.createElement('style');
              style.id = 'epub-custom-style';
              style.textContent = `
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 100% !important;
                  touch-action: manipulation !important;
                  -webkit-overflow-scrolling: touch !important;
                }
                
                body > * {
                  padding-top: 20px !important;
                  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)) !important;
                  padding-left: env(safe-area-inset-left, 0px) !important;
                  padding-right: env(safe-area-inset-right, 0px) !important;
                }
                
                @supports (-webkit-touch-callout: none) {
                  /* iOS-specific optimizations */
                  body {
                    height: -webkit-fill-available !important;
                  }
                }
              `;
              iframeDoc.head.appendChild(style);
            }
          } catch (e) {
            console.error('Error styling iframe:', e);
          }
        }
      });
      
      observer.observe(containerRef.current, { 
        childList: true, 
        subtree: true 
      });
      
      return () => observer.disconnect();
    }
  }, [setContainer]);

  // Calculate container height based on viewport
  // Much more aggressive height reduction for mobile browsers
  const containerHeight = isMobile 
    ? `calc(var(--vh, 1vh) * 70)` // Reduce to 70% of viewport to account for browser UI
    : '80vh';

  // Detect Safari for additional fixes
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /chrome/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Additional height adjustment for iOS browsers
  let heightAdjustment = '0px';
  if (isMobile) {
    if (isSafari && isIOS) {
      heightAdjustment = '80px'; // More space for Safari UI
    } else if (isChrome) {
      heightAdjustment = '60px'; // Space for Chrome UI
    }
  }

  return (
    <div 
      ref={containerRef}
      className="epub-view overflow-hidden w-full" 
      style={{ 
        height: isMobile ? `calc(${containerHeight} - ${heightAdjustment})` : containerHeight,
        background: "#332E38",
        color: theme.text,
        WebkitUserSelect: 'text',
        userSelect: 'text',
        WebkitTouchCallout: 'default',
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        overscrollBehavior: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    />
  );
};

export default ViewerContainer;
