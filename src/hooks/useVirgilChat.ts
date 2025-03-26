import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OutsetaAuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useVirgilChat = (
  initialMessage?: string,
  sessionIdProp?: string,
  promptData?: any
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string>(sessionIdProp || uuidv4());
  const { user } = useAuth();

  // Initialize chat with assistant's greeting
  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: initialMessage,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [initialMessage]);

  // Load existing conversation if session ID is provided
  useEffect(() => {
    const loadExistingConversation = async () => {
      if (!sessionIdProp) return;
      
      try {
        setIsProcessing(true);
        const { data, error } = await supabase
          .from('virgil_messages')
          .select('*')
          .eq('session_id', sessionIdProp)
          .order('timestamp', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: msg.timestamp,
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation history');
      } finally {
        setIsProcessing(false);
      }
    };
    
    loadExistingConversation();
  }, [sessionIdProp]);

  // Save conversation to database
  const saveConversation = useCallback(async (newMessage: Message) => {
    if (!user) return;
    
    try {
      // Save message
      await supabase.from('virgil_messages').insert({
        id: newMessage.id,
        session_id: sessionId,
        role: newMessage.role,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        user_id: user.Uid || user.id, // Handle different user ID formats
      });
      
      // Update or create conversation record
      const lastMessage = newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : '');
      
      const { data: existingConversation } = await supabase
        .from('virgil_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .single();
        
      if (existingConversation) {
        await supabase
          .from('virgil_conversations')
          .update({ 
            last_message: lastMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);
      } else if (promptData) {
        await supabase.from('virgil_conversations').insert({
          session_id: sessionId,
          user_id: user.Uid || user.id, // Handle different user ID formats
          mode_id: promptData.id,
          mode_title: promptData.user_title,
          mode_icon: promptData.icon_display || '💬',
          last_message: lastMessage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, [sessionId, user, promptData]);

  // Add a user message
  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    saveConversation(newMessage);
    return newMessage;
  }, [saveConversation]);

  // Add an assistant message
  const addAssistantMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    saveConversation(newMessage);
    return newMessage;
  }, [saveConversation]);

  // Handle submitting a message
  const handleSubmitMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;
    
    const userMessageContent = inputMessage;
    setInputMessage('');
    setIsProcessing(true);
    
    // Add user message to chat
    addUserMessage(userMessageContent);
    
    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiResponse = `I received your message: "${userMessageContent}". This is a simulated response.`;
        addAssistantMessage(aiResponse);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process your message');
      setIsProcessing(false);
    }
  }, [inputMessage, addUserMessage, addAssistantMessage]);

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  return {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    toggleRecording,
    handleSubmitMessage,
    addUserMessage,
    addAssistantMessage,
    sessionId
  };
};
