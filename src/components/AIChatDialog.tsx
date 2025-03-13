
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../services/AIService';
import conversationManager, { Message } from '../services/ConversationManager';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
  currentQuestionId: string;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ 
  open, 
  onOpenChange,
  currentQuestion,
  currentQuestionId
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { category } = useParams<{ category: string }>();
  
  // Generate a session ID based on the category
  const sessionId = category || 'default';

  // Set the current question in the conversation manager
  useEffect(() => {
    if (currentQuestion && open) {
      conversationManager.setCurrentQuestion(sessionId, currentQuestion);
      conversationManager.setCurrentQuestionId(sessionId, currentQuestionId);
    }
  }, [currentQuestion, currentQuestionId, sessionId, open]);

  // Load messages when the dialog opens
  useEffect(() => {
    if (open) {
      const history = conversationManager.getHistory(sessionId);
      setMessages(history);
      scrollToBottom();
    }
  }, [open, sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !isRecording) return;
    
    try {
      setIsLoading(true);
      const trimmedInput = input.trim();
      setInput('');
      
      // Update UI immediately with user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: trimmedInput,
        timestamp: new Date()
      }]);
      
      // Send message to AI service
      const response = await aiService.generateResponse(sessionId, trimmedInput);
      
      // Update messages with AI response
      setMessages(conversationManager.getHistory(sessionId));
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error
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

  // Request microphone access
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(chunks => [...chunks, e.data]);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        try {
          setIsLoading(true);
          
          // Process audio with AI service
          const response = await aiService.generateResponse(sessionId, "Voice message", audioBlob);
          
          // Update messages with AI response
          setMessages(conversationManager.getHistory(sessionId));
          
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          setIsLoading(false);
          setAudioChunks([]);
        }
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask Virgil</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'bg-muted mr-8'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this question..."
              disabled={isLoading || isRecording}
              className="flex-1"
            />
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              variant="outline"
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={(!input.trim() && !isRecording) || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
