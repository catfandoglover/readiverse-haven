
import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/types/chat';
import aiService from '@/services/AIService';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import { stopAllAudio } from '@/services/AudioContext';
import conversationManager from '@/services/ConversationManager';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";

export const useVirgilChat = (initialMessage?: string, sessionIdProp?: string, promptData?: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionId = useRef(sessionIdProp || uuidv4()).current;
  const { user } = useAuth();

  useEffect(() => {
    // If we have a session ID from props, try to load existing messages
    if (sessionIdProp) {
      const loadExistingMessages = async () => {
        try {
          // Load messages from conversationManager first
          const existingMessages = conversationManager.getHistory(sessionIdProp);
          
          if (existingMessages && existingMessages.length > 0) {
            // Convert to ChatMessage format
            const chatMessages: ChatMessage[] = existingMessages.map(msg => ({
              id: uuidv4(),
              content: msg.content,
              role: msg.role,
              audioUrl: msg.audioUrl,
            }));
            
            setMessages(chatMessages);
            return;
          } 
          
          // If we don't have messages locally, check if we need to add initial message
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
        } catch (error) {
          console.error('Error loading existing messages:', error);
        }
      };
      
      loadExistingMessages();
    } else if (messages.length === 0 && initialMessage) {
      // Just add initial message if we don't have a session ID
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
  }, [initialMessage, sessionIdProp]);

  // Save conversation to history when messages change
  useEffect(() => {
    if (messages.length > 0 && promptData) {
      const saveConversation = async () => {
        try {
          // Get the last message for preview
          const lastMessage = [...messages]
            .reverse()
            .find(msg => msg.role === 'user')?.content;
            
          const userId = user?.id;
          
          const { error } = await supabase
            .from('virgil_conversations')
            .upsert({
              user_id: userId,
              session_id: sessionId,
              mode_id: promptData.id,
              mode_title: promptData.user_title,
              mode_icon: promptData.icon_display || '💭',
              last_message: lastMessage,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'session_id'
            });
            
          if (error) {
            console.error('Error saving conversation:', error);
          }
        } catch (err) {
          console.error('Error in saveConversation:', err);
        }
      };
      
      saveConversation();
    }
  }, [messages, promptData, sessionId, user]);

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
    
    // Add to conversation manager
    conversationManager.addMessage(sessionId, 'assistant', content);
  }, [sessionId]);

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
      
      // Add to conversation manager
      conversationManager.addMessage(sessionId, 'assistant', response.text);
      
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
      
      // Add to conversation manager
      conversationManager.addMessage(sessionId, 'user', displayContent, tempAudioUrl);
      
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
      
      // Add to conversation manager
      conversationManager.addMessage(sessionId, 'assistant', response.text);
      
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
    
    // Add to conversation manager
    conversationManager.addMessage(sessionId, 'user', userMessage);
    
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
