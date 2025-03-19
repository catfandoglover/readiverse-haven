
class ConversationManager {
  private history: Record<string, Array<{ role: string; content: string }>> = {};
  private questionPath: Record<string, Array<{ questionId: string; question: string; answer: string }>> = {};

  constructor() {
    // Initialize from localStorage if available
    try {
      const savedHistory = localStorage.getItem('aiChatHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
      
      const savedQuestionPath = localStorage.getItem('aiQuestionPath');
      if (savedQuestionPath) {
        this.questionPath = JSON.parse(savedQuestionPath);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  addMessage(sessionId: string, role: string, content: string) {
    if (!this.history[sessionId]) {
      this.history[sessionId] = [];
    }
    this.history[sessionId].push({ role, content });
    this.saveToLocalStorage();
  }

  addQuestionToPath(sessionId: string, questionId: string, question: string, answer: string) {
    if (!this.questionPath[sessionId]) {
      this.questionPath[sessionId] = [];
    }
    this.questionPath[sessionId].push({ questionId, question, answer });
    localStorage.setItem('aiQuestionPath', JSON.stringify(this.questionPath));
  }

  getHistory(sessionId: string) {
    return this.history[sessionId] || [];
  }

  getQuestionPath(sessionId: string) {
    return this.questionPath[sessionId] || [];
  }

  clearHistory(sessionId: string) {
    if (this.history[sessionId]) {
      delete this.history[sessionId];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('aiChatHistory', JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  async saveConversationToSupabase(
    sessionId: string, 
    assessmentId: string, 
    userId: string, 
    currentQuestionId: string
  ) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const questionPath = this.getQuestionPath(sessionId);
      const history = this.getHistory(sessionId);
      
      if (!questionPath.length && !history.length) {
        console.log('No conversation data to save');
        return;
      }
      
      const conversationData = {
        assessment_id: assessmentId,
        user_id: userId,
        question_id: currentQuestionId,
        question_path: JSON.stringify(questionPath),
        chat_history: JSON.stringify(history),
        created_at: new Date().toISOString()
      };
      
      console.log('Saving conversation to Supabase:', conversationData);
      
      const { data, error } = await supabase
        .from('dna_conversation_history')
        .insert(conversationData);
      
      if (error) {
        console.error('Error saving conversation to Supabase:', error);
        throw error;
      }
      
      console.log('Conversation saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in saveConversationToSupabase:', error);
      throw error;
    }
  }
}

// Singleton instance
const conversationManager = new ConversationManager();
export default conversationManager;
