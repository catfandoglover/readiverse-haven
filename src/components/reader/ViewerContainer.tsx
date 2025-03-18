
import React, { useCallback, useState } from 'react';
import type { Theme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer,
  onPrevPage,
  onNextPage
}) => {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Get the target element and its position
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    
    // Get the parent element (the actual reading view)
    const parent = container.querySelector('.epub-container');
    
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    
    // Calculate the x position relative to the container
    const x = e.clientX - containerRect.left;
    
    // Calculate the left and right margins - the space between container edges and parent edges
    const leftMargin = parentRect.left - containerRect.left;
    const rightMargin = containerRect.right - parentRect.right;
    
    // If click is in left margin of the container (outside the parent element), go to previous page
    if (x < parentRect.left - containerRect.left && onPrevPage) {
      onPrevPage();
    }
    // If click is in right margin of the container (outside the parent element), go to next page
    else if (x > parentRect.right - containerRect.left && onNextPage) {
      onNextPage();
    }
  }, [onPrevPage, onNextPage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    
    // Get the parent element (the actual reading view)
    const parent = container.querySelector('.epub-container');
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    
    // Calculate the x position relative to the container
    const x = e.clientX - containerRect.left;
    
    // If mouse is in left margin (outside the parent element)
    if (x < parentRect.left - containerRect.left) {
      setHoveredSide('left');
    } 
    // If mouse is in right margin (outside the parent element)
    else if (x > parentRect.right - containerRect.left) {
      setHoveredSide('right');
    } else {
      setHoveredSide(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSide(null);
  }, []);
  
  return (
    <motion.div 
      ref={(el) => setContainer(el)}
      className="epub-view h-screen border-none overflow-hidden transition-colors duration-300 relative w-full" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        background: theme.background,
        color: theme.text,
        WebkitUserSelect: 'text',
        userSelect: 'text',
        WebkitTouchCallout: 'default',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        overscrollBehavior: 'contain',
        whiteSpace: 'pre-wrap',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        margin: '0 auto',
      }}
    >
      {hoveredSide === 'left' && (
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" 
          style={{ width: '25%' }} />
      )}
      {hoveredSide === 'right' && (
        <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" 
          style={{ width: '25%' }} />
      )}
    </motion.div>
  );
};

export default ViewerContainer;
