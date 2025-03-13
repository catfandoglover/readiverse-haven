
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import AIChatDialog from './AIChatDialog';

interface AIChatButtonProps {
  currentQuestion: string;
  enabled?: boolean;
}

const AIChatButton: React.FC<AIChatButtonProps> = ({ currentQuestion, enabled = true }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get a consistent session ID from sessionStorage
  const sessionId = sessionStorage.getItem('dna_assessment_name') || 'Anonymous';

  if (!enabled) return null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg hover:shadow-xl 
          transition-all duration-200 bg-background border-2 border-primary z-50"
        onClick={() => setIsDialogOpen(true)}
        aria-label="Talk to Virgil AI Assistant"
      >
        <div className="virgil-icon-container">
          <img 
            src="/lovable-uploads/c45050c7-56af-4b5c-9305-d0e18c64a826.png" 
            alt="Virgil" 
            className="virgil-icon"
          />
        </div>
      </Button>
      
      <AIChatDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentQuestion={currentQuestion}
        sessionId={sessionId}
      />
    </>
  );
};

export default AIChatButton;
