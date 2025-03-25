import React, { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/hooks/useAIChat";
import { Dot } from "lucide-react";

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  positiveButtonText?: string;
  negativeButtonText?: string;
  onPositive?: (input: string) => void;
  onNegative?: () => void;
  defaultInput?: string;
  className?: string;
  children?: React.ReactNode;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  positiveButtonText,
  negativeButtonText,
  onPositive,
  onNegative,
  defaultInput = "",
  className,
  children,
}) => {
  const [input, setInput] = useState(defaultInput);
  const { toast } = useToast();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const { isLoading, error, data, sendMessage } = useAIChat();

  // Find and replace the textareaRef references with inputRef
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultInput) {
      setInput(defaultInput);
    }
  }, [defaultInput]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  }, [error, toast]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (onPositive) {
      onPositive(input);
    }

    sendMessage(input);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (input.trim()) {
      setIsAlertDialogOpen(true);
    } else {
      onOpenChange(false);
      if (onNegative) {
        onNegative();
      }
    }
  };

  const handleConfirmClose = () => {
    setIsAlertDialogOpen(false);
    onOpenChange(false);
    if (onNegative) {
      onNegative();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("max-w-2xl", className)}>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="relative">
              <Textarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                className="min-h-[80px] resize-none bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-gray-500"
                placeholder={placeholder || "Ask anything..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dot className="h-6 w-6 animate-pulse text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {negativeButtonText || "Cancel"}
          </Button>
          <Button type="button" onClick={handleSend} disabled={isLoading}>
            {positiveButtonText || "Send"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close? Your input will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  );
};

export default AIChatDialog;
