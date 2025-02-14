
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OutsetaAuthContext';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

const DNAChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setNewMessage(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "There was an error with speech recognition. Please try again or use text input.",
          variant: "destructive"
        });
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const createAssessment = async () => {
      if (!user?.Account?.Uid) return;

      const { data, error } = await supabase
        .from('dna_assessment_results')
        .insert({
          outseta_user_id: user.Account.Uid,
          name: user.Account.Name || 'Anonymous',
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating assessment:', error);
        toast({
          title: "Error",
          description: "Could not start the DNA assessment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setAssessmentId(data.id);
    };

    createAssessment();
  }, [user, toast]);

  const toggleListening = () => {
    if (!recognition.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('philosophical-chat', {
        body: {
          message: userMessage,
          conversationHistory: messages,
          assessment_id: assessmentId
        }
      });

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        { content: userMessage, role: 'user' },
        { content: data.message, role: 'assistant' }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="shrink-0 px-4 py-3 border-b border-border bg-background">
        <h1 className="text-xl font-semibold text-foreground">Philosophical DNA Assessment</h1>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <Card 
              key={index}
              className={`p-4 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-muted mr-12'
              }`}
            >
              {message.content}
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 p-4 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Button
            variant={isListening ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="resize-none"
            rows={1}
          />
          
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DNAChat;
