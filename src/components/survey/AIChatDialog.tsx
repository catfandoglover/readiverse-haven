import React, { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVirgilChat } from "@/hooks/useVirgilChat";

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
  sessionId: string;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  currentQuestion,
  sessionId
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { sendMessage, getMessages } = useVirgilChat();

  useEffect(() => {
    if (open && sessionId) {
      loadMessages();
    }
  }, [open, sessionId]);

  const loadMessages = async () => {
    try {
      const loadedMessages = await getMessages(sessionId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = {
      content: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      if (user) {
        await sendMessage(sessionId, input);
        setInput("");
        await loadMessages();
      } else {
        console.warn("User not authenticated.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Virgil AI Chat</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-150px)] overflow-y-auto px-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.content}
              isUser={message.sender === "user"}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={chatBottomRef} />
        </div>
        <div className="flex items-center border-t pt-4 mt-4 px-4">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            className="flex-1 border rounded-l-md py-2 px-3 text-black"
          />
          <Button onClick={handleSend} className="rounded-r-md bg-blue-500 text-white hover:bg-blue-700">
            <SendHorizontal className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIChatDialog;
