
import React from 'react';
import type { Theme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer 
}) => {
  return (
    <motion.div 
      ref={(el) => setContainer(el)}
      className="epub-view h-screen border-none overflow-hidden transition-colors duration-300" 
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
        maxWidth: '100vw',
        margin: '0 auto',
      }}
    />
  );
};

export default ViewerContainer;
