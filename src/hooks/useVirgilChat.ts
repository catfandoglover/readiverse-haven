
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export function useVirgilChat(initialMessage?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenLimitReached, setTokenLimitReached] = useState(false);
  const sessionId = useRef(uuidv4());

  useEffect(() => {
    // Initialize with system message and welcome message
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'system',
      content: 'You are Virgil, a philosophical AI guide helping users explore the great ideas of history.',
      timestamp: Date.now()
    };

    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: initialMessage || 'Hello, I am Virgil, your philosophical guide. How may I assist you today?',
      timestamp: Date.now()
    };

    setMessages([systemMessage, welcomeMessage]);
    
    // Check token limits
    checkTokenAvailability();
  }, [initialMessage]);

  const checkTokenAvailability = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-token-usage', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error checking token availability:', error);
        return;
      }
      
      setTokenLimitReached(!data.hasAvailableTokens);
      
    } catch (error) {
      console.error('Exception checking token availability:', error);
    }
  };

  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    // Here you would implement actual recording logic
  }, []);

  const handleSubmitMessage = useCallback(async () => {
    if (!inputMessage.trim() || isProcessing || !user) return;
    
    if (tokenLimitReached) {
      toast.error('You have reached your monthly conversation limit. Please upgrade to continue.');
      return;
    }
    
    const userMsg = addUserMessage(inputMessage);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Here you would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      // Mock response for now
      const response = `I understand your question about "${inputMessage}". Let me think about that from a philosophical perspective...`;
      
      addAssistantMessage(response);
      
      // Track conversation for token usage
      await supabase.from('virgil_conversations').upsert({
        user_id: user.id,
        session_id: sessionId.current,
        mode_id: 'default',
        mode_title: 'Philosophical Discussion',
        mode_icon: 'book',
        last_message: inputMessage
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [inputMessage, isProcessing, user, addUserMessage, addAssistantMessage, tokenLimitReached]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    tokenLimitReached,
    toggleRecording,
    handleSubmitMessage,
    addAssistantMessage
  };
}

export default useVirgilChat;
