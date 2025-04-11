import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, X, ArrowUp } from "lucide-react";
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
import SharedVirgilDrawer from '../shared/SharedVirgilDrawer';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        { id: uuidv4(), content: "I'm sorry, it seems like Charon might have throttled my wifi down here and I came upon an error. Let me investigate and get back to you, or maybe try your message again?", role: 'assistant' }
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
          content: "I'm sorry, it seems like Charon might have throttled my wifi down here and I came upon an error. Let me investigate and get back to you, or maybe try your message again? You might want to try a text message instead.", 
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
    <SharedVirgilDrawer
      isOpen={open}
      onClose={() => onOpenChange(false)}
      theme="light"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ paddingBottom: "60px" }}>
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

        <div className="fixed bottom-0 left-0 right-0 w-full z-10">
          <div className="mb-0 rounded-t-2xl overflow-hidden">
            <form 
              onSubmit={handleSubmit} 
              className={cn(
                "flex items-center gap-2 p-4 rounded-t-2xl border-none",
                "bg-[#332E38]/10"
              )}
              style={{ 
                boxShadow: "0 0 0 2px rgba(55, 55, 99, 0.8)" 
              }}
            >
              <AutoResizeTextarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Recording..." : "Message..."}
                className={cn(
                  "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] font-libre-baskerville",
                  "bg-transparent text-[#332E38]",
                  "placeholder:text-[#332E38]"
                )}
                disabled={isProcessing || isRecording}
                minRows={1}
                maxRows={4}
                autoComplete="off"
              />
              {isProcessing ? (
                <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant={isRecording ? "default" : "ghost"} 
                    size="icon"
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={cn(
                      "h-9 w-9 rounded-full flex-shrink-0",
                      isRecording 
                        ? "bg-[#373763] text-[#E9E7E2]" 
                        : "",
                      "transition-colors duration-200",
                      "hover:bg-[#373763] hover:text-[#E9E7E2]"
                    )}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {inputMessage.trim().length > 0 && (
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon"
                      disabled={!inputMessage.trim() || isProcessing}
                      className="h-9 w-9 rounded-full flex-shrink-0 bg-[#373763] flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <ArrowUp className="h-4 w-4 text-transparent stroke-white" />
                    </Button>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </SharedVirgilDrawer>
  );
};

export default AIChatDialog;
