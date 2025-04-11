import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/types/chat';
import speechService from '@/services/SpeechService';
import audioRecordingService from '@/services/AudioRecordingService';
import audioTranscriptionService from '@/services/AudioTranscriptionService';
import { stopAllAudio } from '@/services/AudioContext';
import { useServices } from '@/contexts/ServicesContext';
import { toast } from 'sonner';

interface UseVirgilChatProps {
  userId: string | null | undefined;
  systemPrompt: string;
  storageTable: string; // e.g., 'virgil_general_chat_conversations'
  contextIdentifiers: Record<string, any>; // e.g., { book_id: '123' } or { prompt_id: 'abc' }
  initialMessageOverride?: string; // Optional initial message from assistant
  conversationIdToLoad?: string; // Optional ID to load specific conversation
  isResumable?: boolean; // Default true, set false for non-resumable (like exams)
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Covers transcription, AI response, saving
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Fetch initial conversation history or start new
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationManager || !userId) {
        // console.warn("ConversationManager or userId not available yet for loading.");
        setIsLoadingHistory(false); // Stop loading even if we can't fetch
        return;
      }

      setIsLoadingHistory(true);
      let loadedMessages: ChatMessage[] = [];
      let loadedConversationId: string | null = null;

      try {
        if (conversationIdToLoad) {
          // TODO: Implement fetch by specific ID if needed, ConversationManager doesn't have this yet
          console.warn('Loading specific conversation by ID not fully implemented yet.');
          // Fetch using fetchConversationList with limit 1 and ID filter?
        } else if (isResumable) {
          // Fetch conversation based on context (e.g., user+book, user+course)
          const { data: existingConvo, error } = await conversationManager.fetchConversation(
            storageTable,
            userId,
            contextIdentifiers
          );

          if (error) {
            toast.error('Error loading previous conversation history.');
            console.error('Error fetching conversation:', error);
          } else if (existingConvo && existingConvo.messages) {
            // Map messages from DB structure (no id) to state structure (with id)
            loadedMessages = existingConvo.messages.map(dbMsg => ({
              ...dbMsg, // Includes role, content
              id: uuidv4(), // Generate an ID for the state
              // audioUrl: dbMsg.audioUrl, // Include other fields if they exist on dbMsg
            }));
            loadedConversationId = existingConvo.id;
            console.log(`Resumed conversation ${loadedConversationId} from ${storageTable}`);
          }
        } 
        // If not resumable (exam), or no existing found, loadedMessages remains empty

        // Handle initial message override or default greeting if no history
        if (loadedMessages.length === 0 && initialMessageOverride) {
          const initialAssistantMsg: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: initialMessageOverride,
            // isNew: true // Optional: Add flag if needed by UI
          };
          loadedMessages = [initialAssistantMsg];
          // Don't save this initial override immediately, wait for user interaction
        }

        setMessages(loadedMessages);
        setCurrentConversationId(loadedConversationId); // Store the loaded ID

        // Generate audio for the last message if it's from assistant
        if (loadedMessages.length > 0 && loadedMessages[loadedMessages.length - 1].role === 'assistant') {
          // Delay slightly to ensure UI updates
          setTimeout(() => generateAudioForText(loadedMessages[loadedMessages.length - 1].content), 100);
        }

      } catch (err) {
        toast.error('Failed to load conversation data.');
        console.error('Error in loadConversation effect:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversation();
    // Dependencies: Trigger reload if context changes (e.g., different bookId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationManager, userId, storageTable, JSON.stringify(contextIdentifiers), conversationIdToLoad, isResumable, initialMessageOverride]);

  const generateAudioForText = useCallback(async (text: string) => {
    if (!text) return;
    try {
      stopAllAudio();
      const audioUrl = await speechService.synthesizeSpeech(text);
      setMessages(prevMessages => {
        const lastMsgIndex = prevMessages.length - 1;
        if (lastMsgIndex >= 0 && prevMessages[lastMsgIndex].role === 'assistant') {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], audioUrl };
          return updatedMessages;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Failed to generate audio for Virgil's response.");
    }
  }, []); // Removed generateAudioForText from deps as it causes infinite loops

  // Helper to save conversation state
  const saveConversation = useCallback(async (currentMessages: ChatMessage[]) => {
    if (!conversationManager || !userId || currentMessages.length === 0) return;

    // TODO: Add optimistic updates and better error handling
    try {
      if (currentConversationId) {
        // Update existing conversation
        const { error } = await conversationManager.updateConversation(
          storageTable,
          currentConversationId,
          { messages: currentMessages /*, Add other metadata if needed e.g., status */ }
        );
        if (error) throw error;
        // console.log(`Conversation ${currentConversationId} updated.`);
      } else {
        // Create new conversation
        const { data: newConvo, error } = await conversationManager.createConversation(
          storageTable,
          userId,
          currentMessages,
          contextIdentifiers
        );
        if (error) throw error;
        if (newConvo) {
          setCurrentConversationId(newConvo.id); // Store the new ID
          console.log(`New conversation ${newConvo.id} created in ${storageTable}.`);
        }
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation progress.');
    }
  }, [conversationManager, userId, storageTable, currentConversationId, contextIdentifiers]);

  // Processes text input
  const processTextMessage = useCallback(async (userMessageContent: string) => {
    if (!userMessageContent.trim() || isProcessing || !userId) return;

    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userMessageContent.trim(),
    };
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: 'Thinking...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);

      const assistantMessage: ChatMessage = {
        id: thinkingMessage.id, // Replace the thinking message
        role: 'assistant',
        content: responseText,
      };

      // Update messages state, replacing 'Thinking...' with the actual response
      const finalMessages = messagesWithUser.map(msg => 
        msg.id === thinkingMessage.id ? assistantMessage : msg
      );
      // Ensure thinking message is replaced if it wasn't last
      const finalMessagesWithResponse = [...messagesWithUser.filter(m => m.id !== thinkingMessage.id), assistantMessage];

      setMessages(finalMessagesWithResponse);
      generateAudioForText(responseText);
      await saveConversation(finalMessagesWithResponse);

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error("Virgil encountered an error responding. Please try again.");
      // Remove the 'Thinking...' message on error
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, userId, saveConversation, generateAudioForText]);

  // Processes transcribed audio text
  const processTranscribedAudio = useCallback(async (transcribedText: string, audioUrl?: string) => {
    if (!transcribedText.trim() || isProcessing || !userId) return;

    setIsProcessing(true);
    stopAllAudio();

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: transcribedText.trim(),
      audioUrl: audioUrl, // Include the audio URL if available
    };
    const messagesWithUser = [...messages, newUserMessage];
    setMessages(messagesWithUser);

    const thinkingMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: 'Thinking...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const responseText = await aiService.generateResponse(systemPrompt, messagesWithUser);

      const assistantMessage: ChatMessage = {
        id: thinkingMessage.id, // Replace the thinking message
        role: 'assistant',
        content: responseText,
      };
      
      const finalMessagesWithResponse = [...messagesWithUser.filter(m => m.id !== thinkingMessage.id), assistantMessage];
      setMessages(finalMessagesWithResponse);
      generateAudioForText(responseText);
      await saveConversation(finalMessagesWithResponse);

    } catch (error) {
      console.error('Error processing transcribed audio:', error);
      toast.error("Virgil encountered an error responding. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, messages, systemPrompt, isProcessing, userId, saveConversation, generateAudioForText]);

  // Handles audio recording and transcription
  const handleAudioInput = useCallback(async (audioBlob: Blob) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const tempAudioUrl = audioRecordingService.createAudioUrl(audioBlob);

    // Optimistically add a placeholder message?
    // setMessages(prev => [...prev, { id: uuidv4(), role: 'user', content: 'Processing audio...', audioUrl: tempAudioUrl }]);

    try {
      if (!audioTranscriptionService.isInitialized()) {
        throw new Error('Audio transcription service not ready.');
      }
      const transcription = await audioTranscriptionService.transcribeAudio(audioBlob);
      if (transcription && transcription.trim()) {
         // Now process the transcription as if it were text input
         await processTranscribedAudio(transcription, tempAudioUrl);
      } else {
         toast.info("Couldn't hear anything clearly, please try speaking again.");
         setIsProcessing(false); // Reset processing state if transcription is empty
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error("Failed to process audio. Please try again or use text input.");
      setIsProcessing(false);
    } 
    // No finally here, processing continues in processTranscribedAudio
  }, [isProcessing, processTranscribedAudio]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const audioBlob = await audioRecordingService.stopRecording();
        await handleAudioInput(audioBlob); // Process the blob
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast.error('Error stopping recording.');
        setIsProcessing(false); // Ensure processing stops on error
      }
    } else {
      stopAllAudio();
      try {
        await audioRecordingService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('Could not start recording. Check microphone permissions.');
      }
    }
  }, [isRecording, handleAudioInput]);

  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isRecording) {
       // Stop recording and let the handler process it
       await toggleRecording(); 
       return; 
    }
    // Process text input
    processTextMessage(inputMessage);
    setInputMessage(''); // Clear input after submission
  }, [isRecording, inputMessage, processTextMessage, toggleRecording]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    isRecording,
    isProcessing,
    isLoadingHistory,
    currentConversationId,
    toggleRecording,
    handleSubmit,
    // Expose other methods if needed by UI, e.g., processTextMessage directly?
  };
};
