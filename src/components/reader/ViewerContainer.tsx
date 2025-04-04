
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
      className="epub-view h-[80vh] overflow-hidden" 
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
        whiteSpace: 'pre-line', // Preserves line breaks in text
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}
    />
  );
};

export default ViewerContainer;
