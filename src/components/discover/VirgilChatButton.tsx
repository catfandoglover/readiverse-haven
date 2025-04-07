import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirgilChatButtonProps {
  contentTitle: string;
  contentId: string;
  contentType: "classic" | "icon" | "concept" | "question";
  variant?: "icon" | "button";
  className?: string;
  iconClassName?: string;
}

const VirgilChatButton = ({
  contentTitle,
  contentId,
  contentType,
  variant = "icon",
  className,
  iconClassName
}: VirgilChatButtonProps) => {
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

  if (variant === "button") {
    return (
      <button
        onClick={handleVirgilChat}
        className={cn("flex items-center gap-2 py-2 px-3 rounded-md", className)}
      >
        <div className="relative flex items-center justify-center">
          {/* Hexagon background */}
          <Hexagon className="h-5 w-5 text-[#CCFF23]" strokeWidth={2} />
          
          {/* Virgil icon on top */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img 
              src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Dot.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBEb3QucG5nIiwiaWF0IjoxNzQ0MDU2NjY5LCJleHAiOjEwMzgzOTcwMjY5fQ.RFSdd2eKLrgMOBG9mGeMcEMi_GIXU4E7SvRjdF5ZoYY"
              alt="Chat with Virgil" 
              className="h-4 w-4 object-cover"
            />
          </div>
        </div>
        <span>Chat with Virgil</span>
      </button>
    );
  }

  return (
    <button
      className={cn("flex items-center justify-center", className)}
      aria-label="Chat with Virgil"
      onClick={handleVirgilChat}
    >
      <div className="relative flex items-center justify-center hover:scale-110 transition-transform">
        {/* Hexagon background */}
        <Hexagon className="h-7 w-7 text-[#CCFF23]" strokeWidth={2} />
        
        {/* Virgil icon on top */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Dot.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBEb3QucG5nIiwiaWF0IjoxNzQ0MDU2NjY5LCJleHAiOjEwMzgzOTcwMjY5fQ.RFSdd2eKLrgMOBG9mGeMcEMi_GIXU4E7SvRjdF5ZoYY"
            alt="Chat with Virgil" 
            className="h-6 w-6 object-cover"
          />
        </div>
      </div>
    </button>
  );
};

export default VirgilChatButton;
