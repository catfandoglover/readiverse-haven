import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

interface AIChatButtonProps {
  onClick: () => void;
  enabled?: boolean;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ onClick, enabled = true }) => {
  console.log('AIChatButton rendering, enabled:', enabled);

  if (!enabled) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg hover:shadow-xl 
        transition-all duration-200 bg-background border-2 border-primary z-50"
      onClick={onClick}
      aria-label="Talk to AI Assistant"
    >
      <MessageSquareText className="h-6 w-6 text-primary" />
    </Button>
  );
};

export default AIChatButton; 
