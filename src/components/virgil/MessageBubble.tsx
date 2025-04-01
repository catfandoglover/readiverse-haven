
import React from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/chat';
import { ThemeColors } from './VirgilChatThemes';

interface MessageBubbleProps {
  message: ChatMessage;
  themeColors: ThemeColors;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, themeColors }) => {
  const isUser = message.role === 'user';

  return (
    <>
      {isUser ? (
        <div
          className={cn(
            "flex items-start max-w-[80%] p-3 rounded-xl ml-auto",
            themeColors.userMessageBg,
            themeColors.text
          )}
        >
          <p className="text-sm whitespace-pre-wrap font-libre-baskerville">{message.content}</p>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-start max-w-[80%] mr-auto",
            themeColors.text
          )}
        >
          <img 
            src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil%20Chat.png" 
            className="h-5 w-5 mt-1 mr-2 flex-shrink-0" 
            aria-hidden="true" 
            alt="Virgil" 
          />
          <p className="text-sm whitespace-pre-wrap font-libre-baskerville">{message.content}</p>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
