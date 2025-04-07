import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingVirgilButtonProps {
  contentTitle: string;
  contentId: string;
  contentType: "classic" | "icon" | "concept" | "question";
}

const FloatingVirgilButton: React.FC<FloatingVirgilButtonProps> = ({
  contentTitle,
  contentId,
  contentType
}) => {
  const navigate = useNavigate();

  const handleVirgilChat = () => {
    // Navigate to VirgilChat with prompt data
    navigate('/virgil-chat', {
      state: {
        promptData: {
          id: 2, // Grow My Mind prompt ID
          user_title: `Discuss: ${contentTitle}`,
          user_subtitle: `Chat with Virgil about this ${contentType}`,
          context: `${contentType}_id:${contentId}`,
          initial_message: `I see you're interested in discussing "${contentTitle}". What aspects of this ${contentType} would you like to explore?`
        }
      }
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={handleVirgilChat}
        className="relative flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
        aria-label="Chat with Virgil"
      >
        {/* Hexagon background */}
        <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={2} />
        
        {/* Virgil icon on top */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Dot.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBEb3QucG5nIiwiaWF0IjoxNzQ0MDU2NjY5LCJleHAiOjEwMzgzOTcwMjY5fQ.RFSdd2eKLrgMOBG9mGeMcEMi_GIXU4E7SvRjdF5ZoYY"
            alt="Chat with Virgil" 
            className="h-11 w-11 object-cover"
          />
        </div>
      </button>
    </div>
  );
};

export default FloatingVirgilButton; 