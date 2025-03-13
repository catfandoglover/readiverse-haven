
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import conversationManager, { Message as ConversationMessage } from '@/services/ConversationManager';
import ChatMessage from './ChatMessage';
import { stopAllAudio } from '@/services/AudioContext';

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
      
      // Use the provided sessionId or fallback to a default
      const userId = providedSessionId || sessionStorage.getItem('dna_assessment_name') || 'Anonymous';
      
      if (!sessionId || questionChanged) {
        setSessionId(userId);
        setIsFirstOpen(true); // Reset first open flag for new question
        setLastQuestion(currentQuestion);
        setMessages([]); // Clear messages when question changes
        
        // Set the current question in the conversation manager
        conversationManager.setCurrentQuestion(userId, currentQuestion);
        
        // Initialize the conversation with an automatic greeting
        conversationManager.initializeConversation(userId);
        
        // Update the local messages state with the greeting
        const history = conversationManager.getHistory(userId);
        // Convert ConversationManager messages to our local Message format with IDs
        const messagesWithIds = history.map(msg => ({
          id: uuidv4(),
          content: msg.content,
          role: msg.role,
          audioUrl: msg.audioUrl,
          isNew: true
        }));
        setMessages(messagesWithIds);
      } else {
        // Update the current question in case it changed
        conversationManager.setCurrentQuestion(userId, currentQuestion);
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
            role: 'assistant',
            isNew: true
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
      
      // Focus the input when opened
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
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
      // Stop any currently playing audio before generating a new one
      stopAllAudio();
      
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

  // Handle key press events for the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle text message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If recording is in progress, stop and send the audio
    if (isRecording) {
      await stopAndProcessRecording();
      return;
    }
    
    // Otherwise, process text message as usual
    if (!inputMessage.trim() || isProcessing) return;
    
    // Stop any playing audio before processing the new message
    stopAllAudio();
    
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
      // Stop recording and process the audio
      await stopAndProcessRecording();
    } else {
      // Stop any playing audio before starting a new recording
      stopAllAudio();
      
      // Start recording
      try {
        await audioRecordingService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };
  
  // Helper function to stop recording and process the audio
  const stopAndProcessRecording = async () => {
    setIsRecording(false);
    try {
      const audioBlob = await audioRecordingService.stopRecording();
      
      // Process the audio with AI
      await processAudio(audioBlob);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Process user message with AI
  const processMessage = async (userMessage: string) => {
    setIsProcessing(true);
    try {
      // Stop any playing audio before processing
      stopAllAudio();
      
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
            ? { id: msg.id, content: response.text, role: 'assistant', isNew: true } 
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
      // Stop any playing audio before processing
      stopAllAudio();
      
      // Create temporary audio URL for display
      const tempAudioUrl = audioRecordingService.createAudioUrl(audioBlob);
      
      // Log audio details for debugging
      console.log(`Processing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      // Add loading message for transcription
      const transcriptionLoadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: transcriptionLoadingId, content: 'Transcribing your voice message...', role: 'assistant' }
      ]);
      
      // Get response from AI service, passing the audio blob for transcription and processing
      const response = await aiService.generateResponse(sessionId, "Voice message", audioBlob);
      
      // Remove the transcription loading message
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== transcriptionLoadingId)
      );
      
      // Clean up any debugging artifacts from the transcribed text
      let displayContent = response.transcribedText || "Voice message";
      
      // Log the final clean result for debugging
      console.log('Final cleaned transcription:', displayContent);
      
      // Add user audio message to the UI with transcribed text if available
      const newUserMessage: Message = {
        id: uuidv4(),
        content: displayContent,
        role: 'user',
        audioUrl: tempAudioUrl
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Add loading message for AI response
      const loadingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: loadingId, content: 'Processing your message...', role: 'assistant' }
      ]);
      
      // Replace loading message with actual response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === loadingId 
            ? { id: msg.id, content: response.text, role: 'assistant', isNew: true } 
            : msg
        )
      );
      
      // Generate audio for the response
      generateAudioForText(response.text);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Replace loading message with error
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

  // Reset isNew flag when dialog closes
  useEffect(() => {
    if (!open) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isNew: false
        }))
      );
      
      // Stop any playing audio when the dialog closes
      stopAllAudio();
    }
  }, [open]);

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 w-full transition-transform duration-300 transform z-50",
      open ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="relative w-full max-w-md mx-auto">
        {/* Slide up panel with rounded top corners and border */}
        <div className="bg-white border-t-2 border-x-2 border-[#D0CBBD]/25 rounded-t-2xl shadow-lg h-[50vh] flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Discuss with Virgil</h3>
            <div className="text-sm text-muted-foreground">
              Current question: {currentQuestion}
            </div>
          </div>
          
          {/* Chat messages with overflow scrolling */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                content={msg.content}
                role={msg.role}
                audioUrl={msg.audioUrl}
                dialogOpen={open}
                isNewMessage={msg.isNew}
              />
            ))}
            
            {/* Auto-scroll reference element */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area with no border on the input field */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-[#E9E7E2] border-t border-[#D0CBBD]/25">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording..." : "Message Virgil..."}
              className="flex-1 bg-[#E9E7E2] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              disabled={isProcessing || isRecording}
            />
            <Button 
              type="button" 
              variant={isRecording ? "default" : "ghost"} 
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={isRecording ? "bg-red-500 hover:bg-red-600 h-10 w-10 rounded-full" : "h-10 w-10 rounded-full"}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            {isProcessing && (
              <div className="flex items-center justify-center h-10 w-10">
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
