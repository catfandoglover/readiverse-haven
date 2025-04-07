import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface AIChatButtonProps {
  toggleChat: () => void;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ toggleChat }) => {
  return (
    <button
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg hover:shadow-xl 
          transition-all duration-200 bg-white border-2 border-[#373763] hover:scale-110"
      onClick={toggleChat}
      aria-label="Talk to AI Assistant"
      data-test-id="ai-chat-button"
    >
      <MessageSquareText className="h-6 w-6 text-[#373763] mx-auto" />
    </button>
  );
};

export default AIChatButton;