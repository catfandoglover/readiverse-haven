
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import AIChatDialog from './AIChatDialog';

interface AIChatButtonProps {
  currentQuestion: string;
  enabled?: boolean;
  sessionId: string;
  currentQuestionId: string;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ 
  currentQuestion, 
  enabled = true,
  sessionId,
  currentQuestionId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg hover:shadow-xl 
          transition-all duration-200 bg-background border-2 border-primary z-50"
        onClick={() => setIsDialogOpen(true)}
        aria-label="Talk to AI Assistant"
      >
        <MessageSquareText className="h-6 w-6 text-primary" />
      </Button>
      
      <AIChatDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentQuestion={currentQuestion}
        sessionId={sessionId}
        currentQuestionId={currentQuestionId}
      />
    </>
  );
};

export default AIChatButton;
