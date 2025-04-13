import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Base type for DB { role, content }
import { ChatMessage as DbChatMessage } from '@/types/virgil';
// Type expected by AIService and used internally by this hook
import { ChatMessage as AIChatMessage } from '@/types/chat';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import audioTranscriptionService from '@/services/AudioTranscriptionService';
import { stopAllAudio } from '@/services/AudioContext';
import { useServices } from '@/contexts/ServicesContext';
import { toast } from 'sonner';
import { Database } from '@/types/supabase'; // Import Database type for table names

// Internal type for UI state matches AIChatMessage from chat.d.ts
type UIMessage = AIChatMessage;

// Type for the conversation table names from generated types
type ConversationTableName = keyof Database['public']['Tables'];

interface UseVirgilChatProps {
  userId: string | null | undefined;
  systemPrompt: string;
  storageTable: string; // Received as string, cast later
  contextIdentifiers: Record<string, any>;
  initialMessageOverride?: string;
  conversationIdToLoad?: string;
  isResumable?: boolean;
}

// Helper function to strip UI/AI-specific fields for saving to DB
const mapToDbMessages = (uiMessages: UIMessage[]): DbChatMessage[] => {
  return uiMessages.map(({ role, content }) => ({ role, content }));
};

export const useVirgilChat = ({
  userId,
  systemPrompt,
  storageTable,
  contextIdentifiers,
  initialMessageOverride,
  conversationIdToLoad,
  isResumable = true,
}: UseVirgilChatProps) => {
  const { aiService, conversationManager } = useServices();
  console.log("[useVirgilChat] Hook initialized. conversationManager provided:", !!conversationManager); // Log manager status immediately

  // Use the UIMessage type (same as AIChatMessage) for state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Ensure storageTable prop is a valid table name before using
  const validStorageTable = storageTable as ConversationTableName;

  useEffect(() => {
    console.log("[useVirgilChat] useEffect for loadConversation entered."); // Log effect entry

    const loadConversation = async () => {
      console.log("[useVirgilChat] loadConversation async function running. conversationManager:", !!conversationManager, "userId:", userId); // Log initial state
      if (!conversationManager || !userId) {
        console.log("[useVirgilChat] Exiting loadConversation early: conversationManager or userId missing."); // Log reason for early exit
        setIsLoadingHistory(false);
        return;
      }
      setIsLoadingHistory(true);
      let loadedMessages: UIMessage[] = []; // Use UIMessage here
      let loadedConversationId: string | null = null;

      try {
        if (conversationIdToLoad) {
          // TODO: (Low Priority) Implement fetch by specific ID
        } else if (isResumable) {
          const { data: existingConvo, error } = await conversationManager.fetchConversation(
            validStorageTable,
            userId,
            contextIdentifiers
          );
          if (error) {
            toast.error('Error loading previous conversation history.');
          } else if (
            existingConvo &&
            // Type guard: Check if messages property exists and is an array
            'messages' in existingConvo && 
            Array.isArray(existingConvo.messages) &&
            // Check if id property exists (should exist on all table rows)
            'id' in existingConvo &&
            typeof existingConvo.id === 'string' // Ensure id is a string
          ) {
            // Now safe to access messages and id
            console.log("[useVirgilChat] Fetched existing conversation:", existingConvo); // Log fetched data
            loadedMessages = existingConvo.messages.map((dbMsg: DbChatMessage) => ({
              ...dbMsg,
              id: uuidv4(), // Assign a new UUID for React key prop
            }));
            loadedConversationId = existingConvo.id;
            console.log("[useVirgilChat] Mapped messages for UI:", loadedMessages); // Log mapped messages
          } else {
            console.log("[useVirgilChat] No valid existing conversation found or messages missing/invalid.");
          }
        }

        if (loadedMessages.length === 0 && initialMessageOverride) {
          const initialAssistantMsg: UIMessage = { // Use UIMessage
            id: uuidv4(),
            role: 'assistant',
            content: initialMessageOverride,
          };
          loadedMessages = [initialAssistantMsg];
        }

        setMessages(loadedMessages);
        setCurrentConversationId(loadedConversationId);

        if (loadedMessages.length > 0 && loadedMessages[loadedMessages.length - 1].role === 'assistant') {
          setTimeout(() => generateAudioForText(loadedMessages[loadedMessages.length - 1].content), 100);
        }
      } catch (err) {
        toast.error('Failed to load conversation data.');
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationManager, userId, validStorageTable, conversationIdToLoad, isResumable, initialMessageOverride]);

  const generateAudioForText = useCallback(async (text: string) => {
    if (!text) return;
    try {
      stopAllAudio();
      const audioUrl = await speechService.synthesizeSpeech(text);
      setMessages(prevMessages => {
        const lastMsgIndex = prevMessages.length - 1;
        if (lastMsgIndex >= 0 && prevMessages[lastMsgIndex].role === 'assistant') {
          const updatedMessages = [...prevMessages];
          // Add audioUrl to the UIMessage
          updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], audioUrl };
          return updatedMessages;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Failed to generate audio for Virgil's response.");
    }
  }, []);

  const saveConversation = useCallback(async (currentUIMessages: UIMessage[]) => {
    if (!conversationManager || !userId || currentUIMessages.length === 0) return;
    const messagesToSave = mapToDbMessages(currentUIMessages);
    
    try {
      if (currentConversationId) {
        const { error } = await conversationManager.updateConversation(
          validStorageTable, // Use casted table name
          currentConversationId,
          { messages: messagesToSave }
        );
        if (error) throw error;
      } else {
        const { data: newConvo, error } = await conversationManager.createConversation(
          validStorageTable,
          userId,
          messagesToSave,
          contextIdentifiers
        );
        if (error) throw error;
        // Type guard: Check if newConvo and its id exist before setting state
        if (newConvo && 'id' in newConvo && typeof newConvo.id === 'string') {
          setCurrentConversationId(newConvo.id);
        } else {
          console.error('Created conversation data is missing an ID:', newConvo);
          toast.error('Error saving conversation: Invalid data received.');
        }
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation progress.');
    }
  }, [conversationManager, userId, validStorageTable, currentConversationId, contextIdentifiers]);

  const processTextMessage = useCallback(async (userMessageContent: string) => {
    if (!userMessageContent.trim() || isProcessing || !userId) return;
    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: UIMessage = { // Use UIMessage
      id: uuidv4(),
      role: 'user',
      content: userMessageContent.trim(),
    };
    // State uses UIMessage[]
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: UIMessage = { // Use UIMessage
      id: uuidv4(),
      role: 'assistant',
      content: 'Thinking...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Pass UIMessage[] (AIChatMessage[]) directly to AI Service
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);

      const assistantMessage: UIMessage = { // Use UIMessage
        id: thinkingMessage.id,
        role: 'assistant',
        content: responseText,
      };

      const finalMessagesWithResponse = messagesWithUser.filter(m => m.id !== thinkingMessage.id);
      finalMessagesWithResponse.push(assistantMessage);

      setMessages(finalMessagesWithResponse);
      generateAudioForText(responseText);
      // Pass UIMessage[] to saveConversation, it will map internally
      await saveConversation(finalMessagesWithResponse);

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error("Virgil encountered an error responding. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, userId, saveConversation, generateAudioForText]);

  const processTranscribedAudio = useCallback(async (transcribedText: string, audioUrl?: string) => {
    if (!transcribedText.trim() || isProcessing || !userId) return;
    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: UIMessage = { // Use UIMessage
      id: uuidv4(),
      role: 'user',
      content: transcribedText.trim(),
      audioUrl: audioUrl,
    };
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: UIMessage = { // Use UIMessage
      id: uuidv4(),
      role: 'assistant',
      content: 'Thinking...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Pass UIMessage[] (AIChatMessage[]) directly to AI Service
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);

      const assistantMessage: UIMessage = { // Use UIMessage
        id: thinkingMessage.id,
        role: 'assistant',
        content: responseText,
      };

      const finalMessagesWithResponse = messagesWithUser.filter(m => m.id !== thinkingMessage.id);
      finalMessagesWithResponse.push(assistantMessage);

      setMessages(finalMessagesWithResponse);
      generateAudioForText(responseText);
      // Pass UIMessage[] to saveConversation, it will map internally
      await saveConversation(finalMessagesWithResponse);

    } catch (error) {
      console.error('Error processing transcribed audio:', error);
      toast.error("Virgil encountered an error responding. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, userId, saveConversation, generateAudioForText]);

  // --- Recording Logic ---
  const recordingRef = useRef<MediaRecorder | null>(null); // Keep ref for potential internal use by service?
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      stopAllAudio();
      // Don't assign the result to recordingRef.current
      await audioRecordingService.startRecording(); 
      // Assume the service manages the instance internally for stop/cancel
      setIsRecording(true);
      audioChunksRef.current = [];
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return; // Check isRecording, not ref
    try {
      // Call stopRecording without the ref instance
      const audioBlob = await audioRecordingService.stopRecording();
      setIsRecording(false); // Set recording false *before* processing
      setIsProcessing(true);

      if (audioBlob && audioBlob.size > 0) {
        const blobUrl = URL.createObjectURL(audioBlob);
        const transcriptionResult = await audioTranscriptionService.transcribeAudio(audioBlob);
        if (transcriptionResult) {
          await processTranscribedAudio(transcriptionResult, blobUrl);
        } else {
          toast.error('Transcription failed.');
          setIsProcessing(false);
        }
      } else {
        toast.info('No audio detected.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error stopping recording or transcribing:', error);
      toast.error('Failed to process recording.');
      setIsProcessing(false);
    } finally {
      audioChunksRef.current = [];
      // Don't nullify ref here as we don't manage it directly
    }
  };

  const cancelRecording = () => {
    if (isRecording) { // Check isRecording state
      // Call cancelRecording without the ref instance
      audioRecordingService.cancelRecording();
      setIsRecording(false);
      audioChunksRef.current = [];
      toast.info('Recording cancelled.');
    }
  };

  useEffect(() => {
    return () => {
      // If still recording on unmount, try cancelling
      if (isRecording) {
         audioRecordingService.cancelRecording();
      }
      stopAllAudio();
    };
  // Add isRecording to dependency array if cancel logic depends on it
  }, [isRecording]); 

  // Handle text input submit
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    processTextMessage(inputMessage);
    setInputMessage(''); // Clear input after submit
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    messages,
    inputMessage,
    isRecording,
    isProcessing,
    isLoadingHistory,
    handleInputChange,
    handleSubmitMessage,
    toggleRecording,
    cancelRecording,
  };
};
