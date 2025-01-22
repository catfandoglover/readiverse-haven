import React from 'react';
import type { Theme } from '@/contexts/ThemeContext';

interface ViewerContainerProps {
  theme: Theme;
  setContainer: (element: Element | null) => void;
  isHighlightMode?: boolean;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme,
  setContainer,
  isHighlightMode = false
}) => {
  return (
    <div 
      ref={(el) => setContainer(el)}
      className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
      style={{ 
        background: theme.background,
        color: theme.text,
        WebkitUserSelect: isHighlightMode ? 'text' : 'none',
        userSelect: isHighlightMode ? 'text' : 'none',
        WebkitTouchCallout: isHighlightMode ? 'default' : 'none',
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        overscrollBehavior: 'contain',
      }}
    />
  );
};

export default ViewerContainer;