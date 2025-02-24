import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send } from "lucide-react";

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  currentQuestion,
}) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AI chat functionality
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 rounded-md">
            <div className="bg-background p-3 rounded-lg shadow">
              <p className="text-sm text-muted-foreground">
                Current question: {currentQuestion}
              </p>
            </div>
            {/* Chat messages will appear here */}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this question..."
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog; 
