
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import conversationManager from '@/services/ConversationManager';
import { useAIService } from '@/services/AIService';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  currentQuestion: string;
}

const AIChatDialog = ({ open, onOpenChange, sessionId, currentQuestion }: AIChatDialogProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getAIResponse } = useAIService();

  useEffect(() => {
    if (open) {
      // Load existing conversation for this session
      const history = conversationManager.getHistory(sessionId);
      setMessages(history);
      
      // If no previous messages, add a system message about the current question
      if (history.length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: `I'm here to explore your thoughts on: "${currentQuestion}". What would you like to share?`
        };
        setMessages([welcomeMessage]);
        conversationManager.addMessage(sessionId, welcomeMessage.role, welcomeMessage.content);
      }
      
      // Focus the input field
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, sessionId, currentQuestion]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    conversationManager.addMessage(sessionId, userMessage.role, userMessage.content);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get previous question/answers for context
      const questionPath = conversationManager.getQuestionPath(sessionId);
      
      // Build context from question path
      let questionContext = '';
      if (questionPath.length > 0) {
        questionContext = 'Previous questions and answers:\n';
        for (const { question, answer } of questionPath) {
          questionContext += `- Question: "${question}"\n  Answer: ${answer}\n`;
        }
      }
      
      // Get AI response
      const aiResponse = await getAIResponse(
        messages, 
        userMessage.content, 
        currentQuestion,
        questionContext
      );
      
      const assistantMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
      conversationManager.addMessage(sessionId, assistantMessage.role, assistantMessage.content);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing that. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      conversationManager.addMessage(sessionId, errorMessage.role, errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="chat-dialog-container p-0 max-w-full sm:max-w-[500px] h-[80vh] sm:h-[600px] overflow-hidden flex flex-col" onInteractOutside={e => e.preventDefault()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-oxanium text-[#373763] text-lg">Your Thoughts</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5 text-[#373763]" />
          </Button>
        </div>
        
        <div className="chat-content-container flex-1 p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message.content} 
              sender={message.role} 
            />
          ))}
          {isLoading && (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-5 w-5 text-[#373763] animate-spin" />
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts..."
              className="flex-1 bg-white rounded-3xl"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={input.trim() === '' || isLoading}
              className="rounded-full bg-[#373763] hover:bg-[#373763]/90"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
