import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import AIChatDialog from "./AIChatDialog";

const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");

  useEffect(() => {
    const generateSessionId = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  const handleChatOpen = () => {
    setIsOpen(true);
    setCurrentQuestion("");
  };

  return (
    <>
      <button
        onClick={handleChatOpen}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:bg-secondary h-9 px-4 py-2"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Chat with Virgil
      </button>
      
      <AIChatDialog 
        open={isOpen}
        onOpenChange={setIsOpen}
        currentQuestion={currentQuestion}
        sessionId={sessionId}
      />
    </>
  );
};

export default AIChatButton;
