
import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/types/chat';
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import { stopAllAudio } from '@/services/AudioContext';
import conversationManager from '@/services/ConversationManager';

export const useVirgilChat = (initialMessage?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionId = useRef(uuidv4()).current;

  useEffect(() => {
    if (messages.length === 0 && initialMessage) {
      setMessages([
        {
          id: uuidv4(),
          content: initialMessage,
          role: 'assistant',
          isNew: true
        }
      ]);
      
      setTimeout(() => {
        generateAudioForText(initialMessage);
      }, 100);
    }
  }, [initialMessage]);

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

  const addAssistantMessage = useCallback((content: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'assistant',
      isNew: true
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    generateAudioForText(content);
  }, []);

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
      
      const newUserMessage: ChatMessage = {
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

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const audioBlob = await audioRecordingService.stopRecording();
        await processAudio(audioBlob);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
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

  const handleSubmitMessage = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const audioBlob = await audioRecordingService.stopRecording();
        await processAudio(audioBlob);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      return;
    }
    
    if (!inputMessage.trim() || isProcessing) return;
    
    stopAllAudio();
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      content: userMessage,
      role: 'user'
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    await processMessage(userMessage);
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    toggleRecording,
    handleSubmitMessage,
    addAssistantMessage,
    sessionId
  };
};
