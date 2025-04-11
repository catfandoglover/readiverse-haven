import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, X, ArrowUp } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import audioTranscriptionService from '@/services/AudioTranscriptionService';
import ChatMessageDisplay from './ChatMessage';
import { stopAllAudio } from '@/services/AudioContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import SharedVirgilDrawer from '../shared/SharedVirgilDrawer';
import { useServices } from '@/contexts/ServicesContext';
import { toast } from 'sonner';
import { ChatMessage } from '@/types/chat';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
  storageTable?: string;
  contextIdentifiers?: Record<string, any>;
  systemPrompt?: string;
}

const DEFAULT_STORAGE_TABLE = 'virgil_dna_conversations';
const DEFAULT_CONTEXT_IDENTIFIERS = { question: 'unknown' };
const DEFAULT_SYSTEM_PROMPT = "You are Virgil, an AI assistant helping a user reflect on a specific question as part of their Intellectual DNA assessment. Guide them through their thoughts.";

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  currentQuestion,
  storageTable = DEFAULT_STORAGE_TABLE,
  contextIdentifiers = { question: currentQuestion },
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
}) => {
  const { aiService, conversationManager } = useServices();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [lastQuestion, setLastQuestion] = useState(currentQuestion);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const initialGreetings = [
    "Tell me more about your thoughts on this.",
    "What's your initial perspective?",
    "How does this question make you feel?",
    "Let's explore this together."
  ];

  useEffect(() => {
    if (open && conversationManager && aiService?.isInitialized()) {
      const questionChanged = lastQuestion !== currentQuestion;
      const effectiveContext = { ...contextIdentifiers, question: currentQuestion };

      if (questionChanged || isFirstOpen) {
        console.log('AIChatDialog: Initializing or question changed');
        setIsFirstOpen(false);
        setLastQuestion(currentQuestion);
        setMessages([]);
        setCurrentConversationId(null);

        const randomIndex = Math.floor(Math.random() * initialGreetings.length);
        const greeting = initialGreetings[randomIndex];
        const initialMsg: ChatMessage = {
          id: uuidv4(),
          content: greeting,
          role: 'assistant',
        };
        setMessages([initialMsg]);
        setTimeout(() => generateAudioForText(greeting), 100);

      }

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, currentQuestion, conversationManager, aiService]);

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

  const generateAudioForText = useCallback(async (text: string) => {
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
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const saveConversation = useCallback(async (currentMessages: ChatMessage[]) => {
    if (!conversationManager || !currentMessages || currentMessages.length === 0) return;
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        console.warn("Cannot save conversation, user ID not found.");
        return;
    }

    const effectiveContext = { ...contextIdentifiers, question: currentQuestion }; 

    try {
      if (currentConversationId) {
        const { error } = await conversationManager.updateConversation(
          storageTable, currentConversationId, { messages: currentMessages }
        );
        if (error) throw error;
      } else {
        const { data: newConvo, error } = await conversationManager.createConversation(
          storageTable, userId, currentMessages, effectiveContext
        );
        if (error) throw error;
        if (newConvo) setCurrentConversationId(newConvo.id);
      }
    } catch (error) {
      console.error('Error saving DNA chat conversation:', error);
      toast.error('Failed to save chat progress.');
    }
  }, [conversationManager, currentConversationId, storageTable, contextIdentifiers, currentQuestion]);

  const processTextMessage = useCallback(async (userMessageContent: string) => {
    if (!userMessageContent.trim() || isProcessing || !aiService?.isInitialized()) return;

    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: ChatMessage = { id: uuidv4(), role: 'user', content: userMessageContent.trim() };
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'assistant', content: 'Thinking...' };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);
      const assistantMessage: ChatMessage = { id: thinkingMessage.id, role: 'assistant', content: responseText };
      const finalMessages = [...messagesWithUser.filter(m => m.id !== thinkingMessage.id), assistantMessage];
      setMessages(finalMessages);
      generateAudioForText(responseText);
      await saveConversation(finalMessages);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error("Virgil encountered an error. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, saveConversation, generateAudioForText]);

  const processTranscribedAudio = useCallback(async (transcribedText: string, audioUrl?: string) => {
     if (!transcribedText.trim() || isProcessing || !aiService?.isInitialized()) return;

    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: ChatMessage = { id: uuidv4(), role: 'user', content: transcribedText.trim(), audioUrl };
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'assistant', content: 'Thinking...' };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);
      const assistantMessage: ChatMessage = { id: thinkingMessage.id, role: 'assistant', content: responseText };
      const finalMessages = [...messagesWithUser.filter(m => m.id !== thinkingMessage.id), assistantMessage];
      setMessages(finalMessages);
      generateAudioForText(responseText);
      await saveConversation(finalMessages);
    } catch (error) {
      console.error('Error processing transcribed audio:', error);
      toast.error("Virgil encountered an error responding. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, saveConversation, generateAudioForText]);

  const handleAudioInput = useCallback(async (audioBlob: Blob) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const tempAudioUrl = audioRecordingService.createAudioUrl(audioBlob);
    try {
      if (!audioTranscriptionService.isInitialized()) throw new Error('Transcription service unavailable.');
      const transcription = await audioTranscriptionService.transcribeAudio(audioBlob);
      if (transcription && transcription.trim()) {
         await processTranscribedAudio(transcription, tempAudioUrl);
      } else {
         toast.info("Couldn't hear clearly, please try speaking again.");
         setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error("Failed to process audio. Please try again.");
      setIsProcessing(false);
    } 
  }, [isProcessing, processTranscribedAudio]);

  const toggleRecording = useCallback(async () => {
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
  }, [isRecording, handleAudioInput]);

  const stopAndProcessRecording = useCallback(async () => {
    setIsRecording(false);
    try {
      const audioBlob = await audioRecordingService.stopRecording();
      
      await handleAudioInput(audioBlob);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [handleAudioInput]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRecording) {
      await stopAndProcessRecording();
      return;
    }
    
    if (!inputMessage.trim() || isProcessing) return;
    
    stopAllAudio();
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    await processTextMessage(userMessage);
  }, [isRecording, inputMessage, processTextMessage, isProcessing]);

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
      <div className="flex flex-col h-full relative">
        <div className="flex-1 p-4 space-y-2 overflow-y-auto pb-[76px]">
          {messages.map((msg, index) => {
            const isPreviousMessageSameRole = index > 0 && messages[index - 1].role === msg.role;
            return (
              <ChatMessageDisplay 
                key={msg.id}
                content={msg.content}
                role={msg.role}
                audioUrl={msg.audioUrl}
                isNewMessage={false}
                dialogOpen={open}
                isPreviousMessageSameRole={isPreviousMessageSameRole}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-[#E7E4DB]">
          <div className="rounded-t-2xl overflow-hidden">
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
