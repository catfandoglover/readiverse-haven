import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import { stopAllAudio } from '@/services/AudioContext';
import { v4 as uuidv4 } from 'uuid';

interface VirgilChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'virgilchat' | 'virgildna' | 'default';
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  isNew?: boolean;
}

const VirgilChatInterface: React.FC<VirgilChatInterfaceProps> = ({ 
  isOpen, 
  onClose,
  variant = 'default'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(uuidv4()).current;

  const colors = {
    virgilchat: {
      background: 'bg-[#332E38]',
      inputBackground: 'bg-[#221F26]',
      text: 'text-[#E9E7E2]',
      userMessageBg: 'bg-[#4A4351]',
      assistantMessageBg: 'bg-[#221F26]',
      inputText: 'text-[#E9E7E2]',
      inputPlaceholder: 'placeholder:text-[#E9E7E2]/50',
      border: 'border-[#4A4351]'
    },
    virgildna: {
      background: 'bg-[#E7E4DB]',
      inputBackground: 'bg-[#E7E4DB]',
      text: 'text-[#282828]',
      userMessageBg: 'bg-[#332E38]/10',
      assistantMessageBg: 'bg-[#E7E4DB]',
      inputText: 'text-[#282828]',
      inputPlaceholder: 'placeholder:text-muted-foreground',
      border: 'border-[#D0CBBD]/25'
    },
    default: {
      background: 'bg-[#E7E4DB]',
      inputBackground: 'bg-[#E7E4DB]',
      text: 'text-[#282828]',
      userMessageBg: 'bg-[#332E38]/10',
      assistantMessageBg: 'bg-[#E7E4DB]',
      inputText: 'text-[#282828]',
      inputPlaceholder: 'placeholder:text-muted-foreground',
      border: 'border-[#D0CBBD]/25'
    }
  };

  const themeColors = colors[variant];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting = "What's on your mind today?";
      setMessages([
        {
          id: uuidv4(),
          content: initialGreeting,
          role: 'assistant',
          isNew: true
        }
      ]);
      
      setTimeout(() => {
        generateAudioForText(initialGreeting);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
    }
  }, [isOpen]);

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          "p-0 h-[85vh] md:h-[75vh] rounded-t-xl border-0 overflow-hidden",
          themeColors.background
        )}
      >
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          themeColors.border
        )}>
          <div className="w-6" />
          <h2 className={cn(
            "font-oxanium text-sm font-bold tracking-wider uppercase",
            themeColors.text
          )}>
            Virgil's Office
          </h2>
          <div className="w-6" />
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(85vh-120px)] md:h-[calc(75vh-120px)]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start max-w-[80%] p-3 rounded-xl",
                message.role === 'user' 
                  ? cn("ml-auto", themeColors.userMessageBg) 
                  : cn("mr-auto", themeColors.assistantMessageBg),
                themeColors.text
              )}
            >
              {message.role === 'assistant' && (
                <img 
                  src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil%20Chat.png" 
                  className="h-5 w-5 mt-1 mr-2 flex-shrink-0" 
                  aria-hidden="true" 
                  alt="Virgil" 
                />
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={handleSubmit} 
          className={cn(
            "flex items-center gap-2 p-4 border-t",
            themeColors.border,
            themeColors.inputBackground
          )}
        >
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording..." : "Message Virgil..."}
            className={cn(
              "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              themeColors.inputBackground,
              themeColors.inputText,
              themeColors.inputPlaceholder
            )}
            disabled={isProcessing || isRecording}
            autoComplete="off"
          />
          {isProcessing ? (
            <div className="flex items-center justify-center h-10 w-10">
              <Loader2 className={cn("h-4 w-4 animate-spin", themeColors.text)} />
            </div>
          ) : (
            <>
              <Button 
                type="button" 
                variant={isRecording ? "default" : "ghost"} 
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "h-10 w-10 rounded-full",
                  isRecording && "bg-[#CCFF23] hover:bg-[#CCFF23]/90"
                )}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-[#282828]" />
                ) : (
                  <Mic className={cn("h-4 w-4", themeColors.text)} />
                )}
              </Button>
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon"
                disabled={!inputMessage.trim() && !isRecording}
                className="h-10 w-10 rounded-full"
                aria-label="Send message"
              >
                <Send className={cn("h-4 w-4", themeColors.text)} />
              </Button>
            </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default VirgilChatInterface;
