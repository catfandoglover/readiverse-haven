import React from 'react';
import type { Theme } from '@/contexts/ThemeContext';

interface ViewerContainerProps {
  theme: Theme;
}

const ViewerContainer: React.FC<ViewerContainerProps & { children?: React.ReactNode }> = ({ 
  theme,
  children 
}) => {
  return (
    <div 
      className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden shadow-lg reader-container" 
      style={{ 
        background: theme.background,
        color: theme.text,
      }}
    >
      {children}
    </div>
  );
};

export default ViewerContainer;