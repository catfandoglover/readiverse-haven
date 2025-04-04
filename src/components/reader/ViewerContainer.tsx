import React, { useEffect, useRef } from 'react';
import type { Theme } from '@/contexts/ThemeContext';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
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
              
              // Create and add our new style - minimal necessary styling
              const style = iframeDoc.createElement('style');
              style.id = 'epub-custom-style';
              style.textContent = `
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 100% !important;
                }
                
                body > * {
                  padding-top: 20px !important;
                  padding-bottom: 20px !important;
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

  return (
    <div 
      ref={containerRef}
      className="epub-view h-[80vh] overflow-hidden w-full" 
      style={{ 
        background: "#332E38",
        color: theme.text,
        WebkitUserSelect: 'text',
        userSelect: 'text',
        WebkitTouchCallout: 'default',
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        overscrollBehavior: 'contain',
      }}
    />
  );
};

export default ViewerContainer;
