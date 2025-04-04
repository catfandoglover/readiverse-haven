
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
      style={{ height: '40vh' }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="w-6" />
        <div className="mx-auto w-12 h-1 bg-[#CCFF33] rounded-full my-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVirgilChat}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="h-full overflow-hidden">
        <VirgilFullScreenChat 
          variant="virgilchat"
          initialMessage={`I'm Virgil, your intellectual guide. We're currently reading "${bookTitle}". How can I assist you with this text?`}
        />
      </div>
    </div>
  );
};

export default VirgilDrawer;
