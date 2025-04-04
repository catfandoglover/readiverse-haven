import React from 'react';
import { X } from 'lucide-react';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';
import VirgilFullScreenChat from '../virgil/VirgilFullScreenChat';
import { Button } from '@/components/ui/button';

interface VirgilDrawerProps {
  bookTitle: string;
}

const VirgilDrawer: React.FC<VirgilDrawerProps> = ({ bookTitle }) => {
  const { showVirgilChat, toggleVirgilChat } = useVirgilReader();

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out bg-[#332E38] border-t border-white/10 shadow-lg rounded-t-xl ${
        showVirgilChat ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}
      style={{ height: '50vh' }}
    >
      <div className="flex items-center justify-center px-4 py-3 relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#CCFF33] rounded-full my-1" />
        <button
          onClick={toggleVirgilChat}
          className="absolute right-4 top-1 p-3 w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-md"
          aria-label="Close Virgil chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="relative h-[calc(50vh-3rem)]">
        <VirgilFullScreenChat 
          variant="virgilchat"
          initialMessage={`I'm Virgil, your intellectual guide. We're currently reading "${bookTitle}". How can I assist you with this text?`}
        />
      </div>
    </div>
  );
};

export default VirgilDrawer;
