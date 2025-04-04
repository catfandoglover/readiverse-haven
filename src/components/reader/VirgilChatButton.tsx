
import React from 'react';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';

const VirgilChatButton: React.FC = () => {
  const { toggleVirgilChat } = useVirgilReader();
  
  return (
    <button
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
      onClick={toggleVirgilChat}
      aria-label="Chat with Virgil"
    >
      <img 
        src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Dot.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBEb3QucG5nIiwiaWF0IjoxNzQzNzg3MTgyLCJleHAiOjEwMzgzNzAwNzgyfQ.pP9ioZgt8DfsnDlUwkdoaStdJioN9-xeLtXJY_VDhME" 
        alt="Virgil" 
        className="w-10 h-10 object-cover"
      />
    </button>
  );
};

export default VirgilChatButton;
