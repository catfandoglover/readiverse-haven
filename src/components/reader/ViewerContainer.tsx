
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
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    // If click is in left margin, go to previous page
    if (e.target === container && x < containerWidth / 2 && onPrevPage) {
      onPrevPage();
    }
    // If click is in right margin, go to next page
    else if (e.target === container && x >= containerWidth / 2 && onNextPage) {
      onNextPage();
    }
  }, [onPrevPage, onNextPage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If the mouse is over the container but not over any of its children
    // (i.e., over the actual margin area), show the hover effect
    if (e.target === e.currentTarget) {
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      
      if (x < containerWidth / 2) {
        setHoveredSide('left');
      } else {
        setHoveredSide('right');
      }
    } else {
      setHoveredSide(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSide(null);
  }, []);
  
  return (
    <div className="relative h-full w-full">
      {/* The outer container captures clicks in the margin area */}
      <div 
        className="absolute inset-0 z-10"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient indicators for the hover state */}
        {hoveredSide === 'left' && (
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        )}
        {hoveredSide === 'right' && (
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* The actual content container */}
      <motion.div 
        ref={(el) => setContainer(el)}
        className="epub-view h-screen max-w-4xl mx-auto border-none overflow-hidden transition-colors duration-300 relative z-0" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
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
        }}
      />
    </div>
  );
};

export default ViewerContainer;
