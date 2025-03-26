
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
        <img 
          src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0MjkzNjUxMSwiZXhwIjoxMDM4Mjg1MDExMX0.HsT3uMlyP1aA14PNfHnQAEmnxy4U4GaBxnuf4aMLL10"
          alt="Chat with Virgil"
          className={cn("h-5 w-5", iconClassName)}
        />
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
      <img 
        src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0MjkzNjUxMSwiZXhwIjoxMDM4Mjg1MDExMX0.HsT3uMlyP1aA14PNfHnQAEmnxy4U4GaBxnuf4aMLL10"
        alt="Chat with Virgil"
        className={cn("h-6 w-6", iconClassName)} 
      />
    </button>
  );
};

export default VirgilChatButton;
