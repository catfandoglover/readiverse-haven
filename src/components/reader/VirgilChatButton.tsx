import React from 'react';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';
import { Hexagon } from 'lucide-react';

const VirgilChatButton: React.FC = () => {
  const { toggleVirgilChat } = useVirgilReader();
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={toggleVirgilChat}
        className="relative flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
        aria-label="Chat with Virgil"
      >
        {/* Hexagon background */}
        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={2} />
        
        {/* Virgil icon on top */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Dot.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBEb3QucG5nIiwiaWF0IjoxNzQ0MDU2NjY5LCJleHAiOjEwMzgzOTcwMjY5fQ.RFSdd2eKLrgMOBG9mGeMcEMi_GIXU4E7SvRjdF5ZoYY"
            alt="Virgil" 
            className="h-11 w-11 object-cover"
          />
        </div>
      </button>
    </div>
  );
};

export default VirgilChatButton;
