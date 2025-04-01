import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, X, Send } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import conversationManager, { Message as ConversationMessage } from '@/services/ConversationManager';
import ChatMessage from './ChatMessage';
import { stopAllAudio } from '@/services/AudioContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  isNew?: boolean;
  transcribedText?: string;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
  sessionId?: string;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  currentQuestion,
  sessionId: providedSessionId
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const initialGreetings = [
    "Tell me more",
    "What's on your mind?",
    "What's your perspective on this?",
    "What comes to mind as you reflect on this question?", 
    "How do you find yourself approaching this question?", 
    "What elements of this question resonate most with you?",
    "What aspects would you like to explore further?",
    "Which considerations feel most significant to you?",
    "How does this question connect with your own experience?",
    "What dimensions of this question intrigue you?"
  ];

  const [lastQuestion, setLastQuestion] = useState(currentQuestion);

  useEffect(() => {
    if (open) {
      const questionChanged = lastQuestion !== currentQuestion;
      
      const userId = providedSessionId || sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      
      if (!sessionId || questionChanged) {
        setSessionId(userId);
        setIsFirstOpen(true);
        setLastQuestion(currentQuestion);
        setMessages([]);
        
        conversationManager.setCurrentQuestion(userId, currentQuestion);
        conversationManager.initializeConversation(userId);
        
        const history = conversationManager.getHistory(userId);
        const messagesWithIds = history.map(msg => ({
          id: uuidv4(),
          content: msg.content,
          role: msg.role,
          audioUrl: msg.audioUrl,
          isNew: true
        }));
        setMessages(messagesWithIds);
        
        const randomIndex = Math.floor(Math.random() * initialGreetings.length);
        const greeting = initialGreetings[randomIndex];
        
        setMessages([
          {
            id: uuidv4(),
            content: greeting,
            role: 'assistant',
            isNew: true
          }
        ]);
        
        if (userId) {
          conversationManager.addMessage(userId, 'assistant', greeting);
        }
        
        setTimeout(() => {
          generateAudioForText(greeting);
        }, 100);
        
        setIsFirstOpen(false);
      } else {
        conversationManager.setCurrentQuestion(userId, currentQuestion);
      }
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open, sessionId, currentQuestion, lastQuestion, initialGreetings]);

  useEffect(() => {
    if (open && isMobile) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.click();
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [open, isMobile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAudioForText = async (text: string) => {
    try {
      stopAllAudio();
      
      const audioUrl = await speechService.synthesizeSpeech(text);
      
      setMessages(prevMessages => {
        const lastAssistantIndex = [...prevMessages].reverse().findIndex(m => m.role === 'assistant');
        if (lastAssistantIndex !== -1) {
          const actualIndex = prevMessages.length - 1 - lastAssistantIndex;
          const updatedMessages = [...prevMessages];
          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            audioUrl
          };
          return updatedMessages;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRecording) {
      await stopAndProcessRecording();
      return;
    }
    
    if (!inputMessage.trim() || isProcessing) return;
    
    stopAllAudio();
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    const newUserMessage: Message = {
      id: uuidv4(),
      content: userMessage,
      role: 'user'
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    await processMessage(userMessage);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopAndProcessRecording();
    } else {
      stopAllAudio();
      
      try {
        await audioRecordingService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const stopAndProcessRecording = async () => {
    setIsRecording(false);
    try {
      const audioBlob = await audioRecordingService.stopRecording();
      
      await processAudio(audioBlob);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const processMessage = async (userMessage: string) => {
    setIsProcessing(true);
    try {
      stopAllAudio();
      
      const loadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: loadingId, content: 'Thinking...', role: 'assistant' }
      ]);
      
      const response = await aiService.generateResponse(sessionId, userMessage);
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === loadingId 
            ? { id: msg.id, content: response.text, role: 'assistant', isNew: true } 
            : msg
        )
      );
      
      generateAudioForText(response.text);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.content !== 'Thinking...')
      );
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: uuidv4(), content: 'Sorry, I encountered an error while processing your message.', role: 'assistant' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      stopAllAudio();
      
      const tempAudioUrl = audioRecordingService.createAudioUrl(audioBlob);
      
      console.log(`Processing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      const transcriptionLoadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: transcriptionLoadingId, content: 'Transcribing your voice message...', role: 'assistant' }
      ]);
      
      const response = await aiService.generateResponse(sessionId, "Voice message", audioBlob);
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== transcriptionLoadingId)
      );
      
      let displayContent = response.transcribedText || "Voice message";
      
      console.log('Final cleaned transcription:', displayContent);
      
      const newUserMessage: Message = {
        id: uuidv4(),
        content: displayContent,
        role: 'user',
        audioUrl: tempAudioUrl
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      const loadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: loadingId, content: 'Processing your message...', role: 'assistant' }
      ]);
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === loadingId 
            ? { id: msg.id, content: response.text, role: 'assistant', isNew: true } 
            : msg
        )
      );
      
      generateAudioForText(response.text);
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prevMessages => 
        prevMessages.filter(msg => 
          msg.content !== 'Transcribing your voice message...' && 
          msg.content !== 'Processing your message...'
        )
      );
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          id: uuidv4(), 
          content: 'I encountered an issue processing your voice message. Please try sending a text message instead.', 
          role: 'assistant' 
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!open) {
      stopAllAudio();
      
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isNew: false
        }))
      );
    }
  }, [open]);

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 w-full transition-transform duration-300 transform z-50",
      open ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="relative w-full max-w-md mx-auto h-[360px]">
        <div className="absolute bottom-0 left-0 right-0 chat-dialog-container flex flex-col font-oxanium h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#E7E4DB] border-b border-[#D0CBBD]/25">
            <div className="w-6" /> {/* Spacer for balance */}
            <h2 className="font-oxanium text-sm font-bold tracking-wider uppercase text-[#282828]">
              Discuss
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4 text-[#282828]" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="chat-content-container flex-1 p-4 space-y-2 overflow-y-auto">
            {messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const isPreviousMessageSameRole = previousMessage ? previousMessage.role === msg.role : false;
              
              return (
                <ChatMessage 
                  key={msg.id}
                  content={msg.content}
                  role={msg.role}
                  audioUrl={msg.audioUrl}
                  dialogOpen={open}
                  isNewMessage={msg.isNew}
                  isPreviousMessageSameRole={isPreviousMessageSameRole}
                />
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-[#E7E4DB] border-t border-[#D0CBBD]/25 shadow-[inset_0px_1px_10px_rgba(255,255,255,0.3)]">
            <AutoResizeTextarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording..." : "Message..."}
              className="flex-1 bg-[#E7E4DB] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-[#282828] font-oxanium min-h-[40px]"
              disabled={isProcessing || isRecording}
              minRows={1}
              maxRows={4}
            />
            <Button 
              type="button" 
              variant={isRecording ? "default" : "ghost"} 
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={cn(
                "h-10 w-10 rounded-full flex-shrink-0",
                isRecording 
                  ? "bg-[#CCFF23] hover:bg-[#CCFF23]/90" 
                  : "text-[#282828]"
              )}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 text-[#282828]" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon"
              disabled={!inputMessage.trim() && !isRecording || isProcessing}
              className="h-10 w-10 rounded-full text-[#282828] flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
            {isProcessing && (
              <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatDialog;
