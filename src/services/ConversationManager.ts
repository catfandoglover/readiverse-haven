
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  audioUrl?: string;
  transcribedText?: string;
}

class ConversationManager {
  private conversations: Map<string, Message[]> = new Map();
  private currentQuestions: Map<string, string> = new Map();
  private currentQuestionIds: Map<string, string> = new Map();
  
  constructor() {
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage() {
    try {
      const savedConversations = localStorage.getItem('aiConversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        
        // Convert the object back to a Map
        Object.keys(parsed.conversations || {}).forEach(key => {
          this.conversations.set(key, parsed.conversations[key]);
        });
        
        Object.keys(parsed.currentQuestions || {}).forEach(key => {
          this.currentQuestions.set(key, parsed.currentQuestions[key]);
        });
        
        Object.keys(parsed.currentQuestionIds || {}).forEach(key => {
          this.currentQuestionIds.set(key, parsed.currentQuestionIds[key]);
        });
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
  }
  
  private saveToLocalStorage() {
    try {
      // Convert Maps to plain objects for JSON serialization
      const conversationsObj: Record<string, Message[]> = {};
      this.conversations.forEach((value, key) => {
        conversationsObj[key] = value;
      });
      
      const currentQuestionsObj: Record<string, string> = {};
      this.currentQuestions.forEach((value, key) => {
        currentQuestionsObj[key] = value;
      });
      
      const currentQuestionIdsObj: Record<string, string> = {};
      this.currentQuestionIds.forEach((value, key) => {
        currentQuestionIdsObj[key] = value;
      });
      
      const dataToSave = {
        conversations: conversationsObj,
        currentQuestions: currentQuestionsObj,
        currentQuestionIds: currentQuestionIdsObj
      };
      
      localStorage.setItem('aiConversations', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }
  
  public initializeConversation(sessionId: string) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
      this.saveToLocalStorage();
    }
  }
  
  public getHistory(sessionId: string): Message[] {
    return this.conversations.get(sessionId) || [];
  }
  
  public addMessage(sessionId: string, role: 'user' | 'assistant', content: string, audioUrl?: string, transcribedText?: string) {
    const newMessage: Message = {
      role,
      content,
      timestamp: new Date(),
      audioUrl,
      transcribedText
    };
    
    // Initialize conversation if it doesn't exist
    this.initializeConversation(sessionId);
    
    // Get current messages
    const messages = this.conversations.get(sessionId) || [];
    
    // Add new message
    messages.push(newMessage);
    
    // Update conversation
    this.conversations.set(sessionId, messages);
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    return newMessage;
  }
  
  public setCurrentQuestion(sessionId: string, question: string) {
    this.currentQuestions.set(sessionId, question);
    this.saveToLocalStorage();
  }
  
  public getCurrentQuestion(sessionId: string): string {
    return this.currentQuestions.get(sessionId) || '';
  }
  
  public setCurrentQuestionId(sessionId: string, questionId: string) {
    this.currentQuestionIds.set(sessionId, questionId);
    this.saveToLocalStorage();
  }
  
  public getCurrentQuestionId(sessionId: string): string {
    return this.currentQuestionIds.get(sessionId) || '';
  }
  
  public clearHistory(sessionId: string) {
    this.conversations.set(sessionId, []);
    this.saveToLocalStorage();
  }
  
  public getAllSessionIds(): string[] {
    return Array.from(this.conversations.keys());
  }
}

// Create singleton instance
const conversationManager = new ConversationManager();

export default conversationManager;
