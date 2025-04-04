
import React from 'react';

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
  show: boolean;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ 
  currentPage, 
  totalPages,
  show
}) => {
  return (
    <div 
      className={`absolute bottom-4 right-4 text-white/70 text-sm transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {currentPage} of {totalPages}
    </div>
  );
};

export default PageIndicator;
