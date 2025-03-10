import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import conversationManager from '@/services/ConversationManager';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: string;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  currentQuestion,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  // Initial greeting messages to choose from
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

  // Track previous question to detect changes
  const [lastQuestion, setLastQuestion] = useState(currentQuestion);

  // Initialize session when dialog opens
  useEffect(() => {
    if (open) {
      // Check if the question has changed since last time
      const questionChanged = lastQuestion !== currentQuestion;
      
      // Generate a unique session ID if one doesn't exist or if question changed
      if (!sessionId || questionChanged) {
        // Create new session when question changes
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        setIsFirstOpen(true); // Reset first open flag for new question
        setLastQuestion(currentQuestion);
        setMessages([]); // Clear messages when question changes
        
        // Set the current question in the conversation manager
        // This is used in the system prompt for the LLM as {current_question}
        conversationManager.setCurrentQuestion(newSessionId, currentQuestion);
        
        // Add an initial user message to ensure proper message ordering
        conversationManager.addMessage(newSessionId, 'user', `I'd like to discuss: ${currentQuestion}`);
      } else {
        // Update the current question in case it changed
        conversationManager.setCurrentQuestion(sessionId, currentQuestion);
      }
      
      // If this is the first time opening the dialog, show a welcome message
      if (isFirstOpen && messages.length === 0) {
        // Select a random greeting from the list
        const randomIndex = Math.floor(Math.random() * initialGreetings.length);
        const greeting = initialGreetings[randomIndex];
        
        setMessages([
          {
            id: uuidv4(),
            content: greeting,
            role: 'assistant'
          }
        ]);
        setIsFirstOpen(false);
        
        // Add the greeting to the conversation manager as well
        if (sessionId) {
          conversationManager.addMessage(sessionId, 'assistant', greeting);
        }
        
        // Generate audio for the greeting
        generateAudioForText(greeting);
      }
    }
  }, [open, sessionId, currentQuestion, isFirstOpen, messages.length, lastQuestion]);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate audio for assistant messages
  const generateAudioForText = async (text: string) => {
    try {
      const audioUrl = await speechService.synthesizeSpeech(text);
      
      // Update the last assistant message with the audio URL
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

  // Handle text message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to the UI
    const newUserMessage: Message = {
      id: uuidv4(),
      content: userMessage,
      role: 'user'
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Process with AI
    await processMessage(userMessage);
  };

  // Handle voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      try {
        const audioBlob = await audioRecordingService.stopRecording();
        
        // Process the audio with AI
        await processAudio(audioBlob);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      // Start recording
      try {
        await audioRecordingService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  // Process user message with AI
  const processMessage = async (userMessage: string) => {
    setIsProcessing(true);
    try {
      // Add loading message
      const loadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: loadingId, content: 'Thinking...', role: 'assistant' }
      ]);
      
      // Get response from AI service
      // Note: AIService now handles adding messages to the conversation history
      const response = await aiService.generateResponse(sessionId, userMessage);
      
      // Replace loading message with actual response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === loadingId 
            ? { id: msg.id, content: response.text, role: 'assistant' } 
            : msg
        )
      );
      
      // Generate audio for the response
      generateAudioForText(response.text);
    } catch (error) {
      console.error('Error processing message:', error);
      // Replace loading message with error
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

  // Process audio with AI
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Create temporary audio URL for display
      const tempAudioUrl = audioRecordingService.createAudioUrl(audioBlob);
      
      // Add user audio message to the UI
      const newUserMessage: Message = {
        id: uuidv4(),
        content: "Voice message",
        role: 'user',
        audioUrl: tempAudioUrl
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Add loading message
      const loadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: loadingId, content: 'Thinking...', role: 'assistant' }
      ]);
      
      // Get response from AI service
      // Note: AIService now handles adding messages to the conversation history
      const response = await aiService.generateResponse(sessionId, "Voice message", audioBlob);
      
      // Replace loading message with actual response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === loadingId 
            ? { id: msg.id, content: response.text, role: 'assistant' } 
            : msg
        )
      );
      
      // Generate audio for the response
      generateAudioForText(response.text);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Replace loading message with error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.content !== 'Thinking...')
      );
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: uuidv4(), content: 'Sorry, I encountered an error while processing your voice message.', role: 'assistant' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="chat-description">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
          <div id="chat-description" className="sr-only">Chat with an AI assistant about this question.</div>
        </DialogHeader>
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 rounded-md">
            <div className="bg-background p-3 rounded-lg shadow">
              <p className="text-sm text-muted-foreground">
                Current question: {currentQuestion}
              </p>
            </div>
            
            {/* Chat messages */}
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                content={msg.content}
                role={msg.role}
                audioUrl={msg.audioUrl}
              />
            ))}
            
            {/* Auto-scroll reference element */}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about this question..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button 
              type="button" 
              variant={isRecording ? "default" : "outline"} 
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputMessage.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
