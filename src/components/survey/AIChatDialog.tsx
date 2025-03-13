
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Loader2, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      // Handle animation when opening
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
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

  // Handle asking in another way
  const handleAskAnotherWay = () => {
    // Clear the input field and current conversation
    setInputMessage('');
    setMessages([]);
    
    // Reinitialize conversation with a new greeting
    if (sessionId) {
      conversationManager.initializeConversation(sessionId);
      
      // Get a random greeting
      const randomIndex = Math.floor(Math.random() * initialGreetings.length);
      const greeting = initialGreetings[randomIndex];
      
      // Add the new greeting
      setMessages([
        {
          id: uuidv4(),
          content: greeting,
          role: 'assistant',
          isNew: true
        }
      ]);
      
      // Generate audio for the greeting
      generateAudioForText(greeting);
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

  if (!open) return null;

  return (
    <div 
      className={cn(
        "fixed inset-x-0 bottom-0 bg-[#E9E7E2] z-50 transition-all duration-300 border-t border-[#373763]/20 shadow-lg",
        isAnimating ? "translate-y-full" : "translate-y-0"
      )}
      style={{ height: "calc(100dvh - 12rem)" }}
      ref={chatContainerRef}
    >
      <div className="flex flex-col h-full relative">
        {/* Close button */}
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full h-8 w-8 text-[#373763]"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-[#E9E7E2] p-3 rounded-lg border border-[#373763]/10 mb-4">
            <p className="text-sm text-[#373763]/80 font-oxanium">
              {currentQuestion}
            </p>
          </div>
          
          {/* Chat messages */}
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
        
        {/* Input area - fixed at the bottom with iOS style */}
        <div className="bg-[#E9E7E2] p-4 border-t border-[#373763]/10">
          <div className="mb-4">
            <Button
              onClick={handleAskAnotherWay}
              variant="outline"
              className="w-full py-2 bg-[#E9E7E2] text-[#373763] border border-[#373763]/20 font-oxanium text-sm uppercase tracking-wider"
            >
              ASK ME ANOTHER WAY
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isRecording ? "Recording..." : "Ask about this question..."}
              className="flex-1 bg-white border-[#373763]/20 rounded-full px-4 h-10 text-[#373763]"
              disabled={isProcessing || isRecording}
            />
            <Button 
              type="button" 
              variant={isRecording ? "default" : "outline"} 
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={cn(
                "rounded-full h-10 w-10", 
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-[#E9E7E2] border border-[#373763]/20 text-[#373763]"
              )}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
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
              disabled={(!inputMessage.trim() && !isRecording) || isProcessing}
              className="rounded-full h-10 w-10 bg-[#373763] text-white"
              aria-label={isRecording ? "Send recording" : "Send message"}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatDialog;
