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
        WebkitUserSelect: 'text', // Enable text selection on iOS
        userSelect: 'text',       // Enable text selection on other browsers
        WebkitTouchCallout: 'default', // Enable the iOS text selection menu
        touchAction: 'pan-y',     // Allow vertical scrolling while maintaining text selection
      }}
    />
  );
};

export default ViewerContainer;