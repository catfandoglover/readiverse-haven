
import React from 'react';
import type { Theme } from '@/contexts/ThemeContext';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer 
}) => {
  return (
    <div 
      ref={(el) => setContainer(el)}
      className="epub-view h-[80vh] border border-gray-200/10 rounded-lg overflow-hidden shadow-lg" 
      style={{ 
        background: theme.background,
        color: theme.text,
        WebkitUserSelect: 'text',
        userSelect: 'text',
        WebkitTouchCallout: 'default',
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        overscrollBehavior: 'contain',
        whiteSpace: 'pre-line', // Preserves line breaks in text
      }}
    />
  );
};

export default ViewerContainer;
