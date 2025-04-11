import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...',
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 text-gray-500">
      <div 
        className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500 ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">{message}</span>
      </div>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 
