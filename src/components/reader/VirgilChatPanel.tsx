
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, SendIcon, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// This would be integrated with actual AI in a real implementation
const MOCK_RESPONSES = [
  "I see you're reading about this topic. Would you like me to explain anything specific about it?",
  "This chapter introduces several key concepts. I can summarize them or explore any particular aspect you're curious about.",
  "That's an excellent question! The author is exploring the idea that...",
  "To better understand this passage, it might help to consider the historical context...",
];

interface BookContext {
  title: string;
  author: string;
  currentChapter: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface VirgilChatPanelProps {
  onClose: () => void;
  bookContext: BookContext;
}

const VirgilChatPanel: React.FC<VirgilChatPanelProps> = ({ onClose, bookContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm Virgil, your reading companion. I see you're reading "${bookContext.title}" by ${bookContext.author}. Currently, you're in the chapter "${bookContext.currentChapter}". How can I assist you with your reading?`,
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div 
      className="fixed bottom-0 right-0 w-full md:w-96 h-96 z-40 rounded-t-2xl overflow-hidden shadow-lg border border-border/30 bg-background/95 backdrop-blur-xl"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="/virgil-avatar.png" alt="Virgil" />
              <AvatarFallback className="bg-primary/20 text-primary">V</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">Virgil</h3>
              <p className="text-xs text-muted-foreground">Your reading companion</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted text-muted-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex justify-end items-center mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {message.role === 'assistant' && (
                        <div className="flex space-x-1 ml-2">
                          <button className="opacity-70 hover:opacity-100">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button className="opacity-70 hover:opacity-100">
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="p-4 border-t border-border/10">
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the book..."
              className="flex-1 min-h-[40px] max-h-[120px]"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isProcessing}
              className="self-end"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VirgilChatPanel;
