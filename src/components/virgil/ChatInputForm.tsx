import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { ThemeColors } from './VirgilChatThemes';

interface ChatInputFormProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isRecording: boolean;
  isProcessing: boolean;
  toggleRecording: () => void;
  themeColors: ThemeColors;
  disabled?: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  inputMessage,
  setInputMessage,
  handleSubmit,
  isRecording,
  isProcessing,
  toggleRecording,
  themeColors,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show send button only when there's text in the input
  const showSendButton = inputMessage.trim().length > 0;

  // Determine shadow color based on theme
  const getShadowColor = () => {
    // Extract the border color from the theme
    const borderColorMatch = themeColors.border.match(/border-\[(.*?)\]/);
    if (borderColorMatch && borderColorMatch[1]) {
      const color = borderColorMatch[1];
      // For opacity colors that end with numbers like /50, make them more visible
      return color.replace(/\/\d+$/, '');
    }
    // Default shadow color
    return 'rgba(51,46,56,0.8)';
  };

  const shadowColor = getShadowColor();
  const formStyle = {
    boxShadow: `0 0 0 2px ${shadowColor}`
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex items-center gap-2 p-4 rounded-t-0 rounded-t-2xl border-none",
        "bg-[#E9E7E2]/80"
      )}
      style={formStyle}
    >
      <AutoResizeTextarea
        ref={textareaRef}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "Recording..." : disabled ? "Chat is disabled while your results are ready" : "Message Virgil..."}
        className={cn(
          "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] font-libre-baskerville",
          "bg-transparent text-[#332E38]",
          "placeholder:text-[#332E38]"
        )}
        disabled={isProcessing || isRecording || disabled}
        minRows={1}
        maxRows={4}
        autoComplete="off"
      />
      {isProcessing ? (
        <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
          <Loader2 className={cn("h-4 w-4 animate-spin", themeColors.text)} />
        </div>
      ) : (
        <>
          <Button 
            type="button" 
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            className={cn(
              "h-9 w-9 rounded-full flex-shrink-0",
              isRecording ? "bg-[#373763] text-[#E9E7E2]" : "",
              "transition-colors duration-200",
              "hover:bg-[#373763] hover:text-[#E9E7E2]"
            )}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={disabled}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          {/* Only show send button when there's text input */}
          {showSendButton && (
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon"
              disabled={!inputMessage.trim() || disabled}
              className="h-9 w-9 rounded-full flex-shrink-0 bg-[#373763] flex items-center justify-center"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4 text-transparent stroke-white" />
            </Button>
          )}
        </>
      )}
    </form>
  );
};

export default ChatInputForm;
