import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuestionPathItem {
  questionId: string;
  questionText: string;
  answer: string;
}

interface ConversationData {
  history: Message[];
  questionPath: QuestionPathItem[];
  currentQuestion?: string;
}

class ConversationManager {
  private conversations: Map<string, ConversationData> = new Map();
  
  constructor() {
    this.conversations = new Map();
  }
  
  // Add a new message to the conversation
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, { history: [], questionPath: [] });
    }
    
    const conversation = this.conversations.get(sessionId)!;
    conversation.history.push({ role, content });
    
    // Keep only the last 10 messages to avoid exceeding context limits
    if (conversation.history.length > 10) {
      conversation.history = conversation.history.slice(conversation.history.length - 10);
    }
  }
  
  // Set the current question being asked
  setCurrentQuestion(sessionId: string, question: string): void {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, { history: [], questionPath: [] });
    }
    
    const conversation = this.conversations.get(sessionId)!;
    conversation.currentQuestion = question;
  }
  
  // Get the current question
  getCurrentQuestion(sessionId: string): string {
    return this.conversations.get(sessionId)?.currentQuestion || '';
  }
  
  // Add a question to the path for context
  addQuestionToPath(
    sessionId: string, 
    questionId: string, 
    questionText: string,
    answer: string
  ): void {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, { history: [], questionPath: [] });
    }
    
    const conversation = this.conversations.get(sessionId)!;
    conversation.questionPath.push({ 
      questionId, 
      questionText,
      answer 
    });
  }
  
  // Get the list of questions that have been answered
  getQuestionPath(sessionId: string): QuestionPathItem[] {
    return this.conversations.get(sessionId)?.questionPath || [];
  }
  
  // Get the conversation history
  getHistory(sessionId: string): Message[] {
    return this.conversations.get(sessionId)?.history || [];
  }
  
  // Clear the conversation history
  clearHistory(sessionId: string): void {
    if (this.conversations.has(sessionId)) {
      const conversation = this.conversations.get(sessionId)!;
      conversation.history = [];
    }
  }
  
  // Generate dynamic system prompt with question context
  generateDynamicSystemPrompt(sessionId: string): string {
    let dynamicPrompt = "You are a helpful assistant answering questions in a philosophical assessment. ";
    dynamicPrompt += "Keep your answers conversational and engaging. ";
    dynamicPrompt += "If the user asks about their assessment results, tell them that their responses are stored and will be analyzed at the end of the assessment.\n\n";
    
    const questionPath = this.getQuestionPath(sessionId);
    
    if (questionPath.length > 0) {
      dynamicPrompt += "The user has already answered these questions:\n\n";
      
      for (const { questionId, questionText, answer } of questionPath) {
        dynamicPrompt += `- Question: "${questionText}" (ID: ${questionId})\n  Answer: ${answer}\n\n`;
      }
    }
    
    if (this.getCurrentQuestion(sessionId)) {
      dynamicPrompt += `The user is currently answering: "${this.getCurrentQuestion(sessionId)}"\n\n`;
    }
    
    dynamicPrompt += "Help the user think through this question if they ask for assistance or clarification.";
    
    return dynamicPrompt;
  }
  
  // Save conversation data to Supabase
  async saveConversationToSupabase(
    sessionId: string, 
    assessmentId: string, 
    userId: string,
    currentQuestionId: string
  ): Promise<boolean> {
    try {
      console.log('Saving conversation to Supabase:', {
        sessionId,
        assessmentId,
        userId,
        currentQuestionId
      });
      
      if (!this.conversations.has(sessionId)) {
        console.log('No conversation data found for this session ID');
        return false;
      }
      
      const conversation = this.conversations.get(sessionId)!;
      
      const { error } = await supabase
        .from('dna_conversation_data')
        .insert({
          assessment_id: assessmentId,
          user_id: userId,
          question_id: currentQuestionId,
          conversation_history: conversation.history,
          question_path: conversation.questionPath,
          current_question: conversation.currentQuestion || ''
        });
        
      if (error) {
        console.error('Error saving conversation to Supabase:', error);
        return false;
      }
      
      console.log('Conversation successfully saved to Supabase');
      return true;
    } catch (error) {
      console.error('Exception in saveConversationToSupabase:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const conversationManager = new ConversationManager();
export default conversationManager;
