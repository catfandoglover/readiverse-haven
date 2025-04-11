import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedVirgilDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  theme?: 'light' | 'dark';
  children: ReactNode;
}

const SharedVirgilDrawer: React.FC<SharedVirgilDrawerProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  children
}) => {
  // Define theme-specific styles
  const bgColor = theme === 'dark' ? 'bg-[#332E38]' : 'bg-[#E7E4DB]';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-[#D0CBBD]/25';
  const handleColor = theme === 'dark' ? 'bg-[#CCFF33]' : 'bg-[#373763]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#373763]';
  const hoverBgColor = theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-[#373763]/10';

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${bgColor} border-t ${borderColor} shadow-lg rounded-t-xl ${
        isOpen ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}
      style={{ height: '50vh' }}
    >
      <div className="flex items-center justify-center px-4 py-3 relative">
        <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-1 ${handleColor} rounded-full my-1`} />
        <button
          onClick={onClose}
          className={`absolute right-4 top-1 p-3 w-10 h-10 flex items-center justify-center ${textColor} ${hoverBgColor} rounded-md`}
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="relative h-[calc(50vh-3rem)] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SharedVirgilDrawer;
