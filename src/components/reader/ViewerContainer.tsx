
import React, { useRef, useEffect } from 'react';

interface ViewerContainerProps {
  theme: string;
  setContainer: (element: HTMLElement | null) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ 
  theme, 
  setContainer,
  onPrevPage,
  onNextPage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }
  }, [setContainer]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onPrevPage || !onNextPage) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    
    // Calculate 10% margin width
    const marginWidth = containerWidth * 0.1;
    
    // Check if click is within left 10% margin
    if (clickX < marginWidth) {
      onPrevPage();
    }
    // Check if click is within right 10% margin
    else if (clickX > containerWidth - marginWidth) {
      onNextPage();
    }
  };

  return (
    <div 
      ref={containerRef} 
      onClick={handleClick}
      className={`w-full min-h-[70vh] md:min-h-[80vh] ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 
        theme === 'sepia' ? 'bg-amber-50 text-amber-900' : 
        'bg-white text-gray-900'
      } transition-colors duration-300 rounded-lg overflow-hidden`}
    />
  );
};

export default ViewerContainer;
