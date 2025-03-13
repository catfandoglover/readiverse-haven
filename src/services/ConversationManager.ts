import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabaseClient';

interface QuestionPathItem {
  questionId: string;
  timestamp: Date;
}

export interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  audioUrl?: string;
}

interface SessionData {
  sessionId: string;
  conversation: Message[];
  currentQuestion: string;
  questionPath: QuestionPathItem[];
  metadata: {
    original_identifier: string;
    is_anonymous: boolean;
  };
}

class ConversationManager {
  private sessions: { [sessionId: string]: SessionData } = {};

  constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('conversationData', JSON.stringify(this.sessions));
  }

  private loadFromLocalStorage() {
    const storedData = localStorage.getItem('conversationData');
    if (storedData) {
      this.sessions = JSON.parse(storedData);
    }
  }

  initializeConversation(sessionId: string, originalIdentifier: string = 'Anonymous', isAnonymous: boolean = true) {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = {
        sessionId: sessionId,
        conversation: [],
        currentQuestion: '',
        questionPath: [],
        metadata: {
          original_identifier: originalIdentifier,
          is_anonymous: isAnonymous
        }
      };
      this.saveToLocalStorage();
    }
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string, audioUrl?: string) {
    if (!this.sessions[sessionId]) {
      console.error('Session not initialized. Call initializeConversation first.');
      return;
    }

    const newMessage: Message = {
      id: uuidv4(),
      content: content,
      role: role,
      timestamp: new Date(),
      audioUrl: audioUrl
    };

    this.sessions[sessionId].conversation.push(newMessage);
    this.saveToLocalStorage();
  }

  getHistory(sessionId: string): Message[] {
    return this.sessions[sessionId]?.conversation || [];
  }

  setCurrentQuestion(sessionId: string, questionId: string) {
    if (!this.sessions[sessionId]) {
      console.error('Session not initialized. Call initializeConversation first.');
      return;
    }

    this.sessions[sessionId].currentQuestion = questionId;
    this.sessions[sessionId].questionPath.push({
      questionId: questionId,
      timestamp: new Date()
    });
    this.saveToLocalStorage();
  }

  getSessionData(sessionId: string): SessionData | undefined {
    return this.sessions[sessionId];
  }

  clearSession(sessionId: string) {
    delete this.sessions[sessionId];
    this.saveToLocalStorage();
  }

  saveToSupabase: async (sessionId: string) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const session = this.getSessionData(sessionId);
      if (!session || !session.conversation || session.conversation.length === 0) {
        console.error('No conversation data to save');
        return false;
      }

      // Convert Message objects to plain objects for JSON compatibility
      const conversationJson = session.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        audioUrl: msg.audioUrl
      }));

      const questionPathJson = session.questionPath.map(qp => ({
        questionId: qp.questionId,
        timestamp: qp.timestamp
      }));

      const metadata = {
        original_identifier: session.metadata.original_identifier,
        is_anonymous: session.metadata.is_anonymous
      };

      // Save conversation to database
      const { error } = await supabase
        .from('conversations')
        .insert({
          session_id: sessionId,
          question_id: session.currentQuestion || 'unknown',
          messages: conversationJson,
          metadata: metadata,
          question_path: questionPathJson
        });

      if (error) {
        console.error('Error saving conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveToSupabase:', error);
      return false;
    }
  }
}

const conversationManager = new ConversationManager();
export default conversationManager;
