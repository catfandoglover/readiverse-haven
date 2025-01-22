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
      className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg" 
      style={{ 
        background: theme.background,
        color: theme.text,
        WebkitUserSelect: 'text',
        WebkitTouchCallout: 'default',
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
      }}
    />
  );
};

export default ViewerContainer;