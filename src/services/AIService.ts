
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAIService = () => {
  const getAIResponse = useCallback(async (
    history: Array<{role: string; content: string}>,
    userMessage: string,
    currentQuestion: string,
    questionContext: string = '',
  ) => {
    try {
      // Create a system prompt that includes question context
      const systemPrompt = `You are a philosophical AI assistant helping someone explore their worldview through a series of philosophical questions. You are currently discussing: "${currentQuestion}".

${questionContext}

Your role is to help them reflect on their answers, explore implications, and deepen their understanding. Be thoughtful, open-minded, and avoid imposing any particular worldview. Ask clarifying questions when appropriate.`;

      // Format conversation history for the API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
      ];

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages },
      });

      if (error) throw error;

      return data.message || 'I\'m not sure how to respond to that.';
    } catch (error) {
      console.error('Error in AI service:', error);
      throw error;
    }
  }, []);

  return { getAIResponse };
};
