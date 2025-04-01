
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
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

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex items-center gap-2 p-4 border-t rounded-t-2xl",
        themeColors.border,
        themeColors.inputBackground
      )}
    >
      <AutoResizeTextarea
        ref={textareaRef}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "Recording..." : disabled ? "Chat is disabled while your results are ready" : "Message Virgil..."}
        className={cn(
          "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] font-libre-baskerville",
          themeColors.inputBackground,
          themeColors.inputText,
          themeColors.inputPlaceholder
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
            variant={isRecording ? "default" : "ghost"} 
            size="icon"
            onClick={toggleRecording}
            className={cn(
              "h-10 w-10 rounded-full flex-shrink-0",
              isRecording && "bg-[#CCFF23] hover:bg-[#CCFF23]/90"
            )}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={disabled}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 text-[#282828]" />
            ) : (
              <Mic className={cn("h-4 w-4", themeColors.text)} />
            )}
          </Button>
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon"
            disabled={(!inputMessage.trim() && !isRecording) || disabled}
            className="h-10 w-10 rounded-full flex-shrink-0"
            aria-label="Send message"
          >
            <Send className={cn("h-4 w-4", themeColors.text)} />
          </Button>
        </>
      )}
    </form>
  );
};

export default ChatInputForm;
