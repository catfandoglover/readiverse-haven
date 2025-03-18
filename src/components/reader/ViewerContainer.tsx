
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
  // Margin width for click detection (percentage of container width)
  const MARGIN_WIDTH_PERCENT = 5; // Changed from 20% to 5%
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    // Calculate margins based on percentage
    const leftMarginWidth = containerWidth * (MARGIN_WIDTH_PERCENT / 100);
    const rightMarginWidth = containerWidth * (MARGIN_WIDTH_PERCENT / 100);
    
    // If click is in left margin, go to previous page
    if (x < leftMarginWidth && onPrevPage) {
      onPrevPage();
    }
    // If click is in right margin, go to next page
    else if (x > containerWidth - rightMarginWidth && onNextPage) {
      onNextPage();
    }
  }, [onPrevPage, onNextPage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    // Calculate margins based on percentage
    const leftMarginWidth = containerWidth * (MARGIN_WIDTH_PERCENT / 100);
    const rightMarginWidth = containerWidth * (MARGIN_WIDTH_PERCENT / 100);
    
    if (x < leftMarginWidth) {
      setHoveredSide('left');
    } else if (x > containerWidth - rightMarginWidth) {
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
      className="epub-view h-screen border-none overflow-hidden transition-colors duration-300 relative" 
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
        maxWidth: '100vw',
        margin: '0 auto',
      }}
    >
      {hoveredSide === 'left' && (
        <div className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      )}
      {hoveredSide === 'right' && (
        <div className="absolute inset-y-0 right-0 w-[5%] bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

export default ViewerContainer;
