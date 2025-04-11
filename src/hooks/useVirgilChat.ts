import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/types/virgil'; // Base type { role, content }
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import audioTranscriptionService from '@/services/AudioTranscriptionService';
import { stopAllAudio } from '@/services/AudioContext';
import { useServices } from '@/contexts/ServicesContext';
import { toast } from 'sonner';
import { Database } from '@/types/supabase'; // Import Database type for table names

// Internal type for UI state, extending the base DB type
type UIMessage = ChatMessage & {
  id: string;
  audioUrl?: string;
};

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

// Helper function to strip UI-specific fields for saving/sending to AI
const mapToDbMessages = (uiMessages: UIMessage[]): ChatMessage[] => {
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
  // Use the internal UIMessage type for state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Ensure storageTable prop is a valid table name before using
  const validStorageTable = storageTable as ConversationTableName;

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationManager || !userId) {
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
            validStorageTable, // Use casted table name
            userId,
            contextIdentifiers
          );
          if (error) {
            toast.error('Error loading previous conversation history.');
          } else if (existingConvo?.messages) {
            // Map messages from DB structure (ChatMessage) to state structure (UIMessage)
            loadedMessages = existingConvo.messages.map((dbMsg) => ({
              ...dbMsg,
              id: uuidv4(), // Generate an ID for the state
              // audioUrl is added later if needed
            }));
            loadedConversationId = existingConvo.id;
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
  }, [conversationManager, userId, validStorageTable, JSON.stringify(contextIdentifiers), conversationIdToLoad, isResumable, initialMessageOverride]);

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

    // Map UIMessages back to basic ChatMessages for saving
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
          validStorageTable, // Use casted table name
          userId,
          messagesToSave,
          contextIdentifiers
        );
        if (error) throw error;
        if (newConvo) {
          setCurrentConversationId(newConvo.id);
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
      // Map to base ChatMessage[] for AI Service
      const responseText = await aiService.generateResponse(systemPrompt, mapToDbMessages(messagesWithUser));

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
      // Map to base ChatMessage[] for AI Service
      const responseText = await aiService.generateResponse(systemPrompt, mapToDbMessages(messagesWithUser));

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
  const recordingRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      stopAllAudio(); // Stop any Virgil speech
      recordingRef.current = await audioRecordingService.startRecording((chunk) => {
        audioChunksRef.current.push(chunk);
      });
      setIsRecording(true);
      audioChunksRef.current = []; // Clear previous chunks
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !recordingRef.current) return;
    try {
      const audioBlob = await audioRecordingService.stopRecording(recordingRef.current);
      recordingRef.current = null;
      setIsRecording(false);
      setIsProcessing(true); // Indicate processing starts (transcription)

      if (audioBlob && audioBlob.size > 0) {
        const blobUrl = URL.createObjectURL(audioBlob);
        // Transcribe the audio
        const transcriptionResult = await audioTranscriptionService.transcribeAudio(audioBlob);
        if (transcriptionResult) {
          // Process the transcribed text, passing the blob URL
          await processTranscribedAudio(transcriptionResult, blobUrl);
        } else {
          toast.error('Transcription failed. Please try speaking again.');
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
       // Reset state regardless of transcription success/failure
       audioChunksRef.current = [];
       recordingRef.current = null; 
       // setIsProcessing(false); // Already handled in success/error paths
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (isRecording && recordingRef.current) {
      audioRecordingService.cancelRecording(recordingRef.current);
      recordingRef.current = null;
      setIsRecording(false);
      audioChunksRef.current = [];
      toast.info('Recording cancelled.');
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        audioRecordingService.cancelRecording(recordingRef.current);
      }
      stopAllAudio();
    };
  }, []);

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
