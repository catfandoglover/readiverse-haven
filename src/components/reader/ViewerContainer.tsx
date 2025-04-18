import React, { useEffect, useRef } from 'react';
import type { Theme } from '@/contexts/ThemeContext';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';

interface ViewerContainerProps {
  theme: {
    text: string;
  };
  setContainer: (node: HTMLDivElement | null) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { showVirgilChat } = useVirgilReader();
  
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
                  overflow: hidden !important;
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

  // Enhanced effect to handle resize when drawer state changes
  useEffect(() => {
    const iframe = containerRef.current?.querySelector('iframe');
    if (iframe) {
      try {
        // Give time for the transition to complete
        setTimeout(() => {
          // Force a reflow of the content
          if (iframe.contentWindow) {
            // Trigger resize on the iframe's window
            iframe.contentWindow.dispatchEvent(new Event('resize'));
            
            // Force reflow by temporarily modifying a style
            const doc = iframe.contentDocument;
            if (doc && doc.body) {
              doc.body.style.display = 'none';
              doc.body.offsetHeight; // Force reflow
              doc.body.style.display = '';
              
              // Additional reflow for epub.js
              const viewportElement = doc.querySelector('[name="viewport"]');
              if (viewportElement) {
                viewportElement.setAttribute('content', 
                  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
              }
            }
          }
          
          // Also trigger resize on the main window
          window.dispatchEvent(new Event('resize'));
        }, 300); // Wait for transition to complete
      } catch (e) {
        console.error('Error triggering resize:', e);
      }
    }
  }, [showVirgilChat]);

  return (
    <div 
      ref={containerRef}
      className={`epub-view w-full h-full overflow-hidden transition-all duration-300`}
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
