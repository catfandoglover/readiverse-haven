import { supabase } from "@/integrations/supabase/client";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface QuestionPath {
  questionId: string;
  question: string;
  answer: string;
}

class ConversationManager {
  private conversations: Map<string, Message[]> = new Map();
  private questionPaths: Map<string, QuestionPath[]> = new Map();
  private currentQuestionIds: Map<string, string> = new Map();
  private currentQuestions: Map<string, string> = new Map();
  private expiryMinutes = 30;

  // Add a message to the conversation
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string, audioUrl?: string): void {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const message: Message = {
      role,
      content,
      timestamp: new Date(),
      audioUrl
    };

    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.push(message);
      this._cleanExpired(sessionId);
    }
  }

  // Get conversation history
  getHistory(sessionId: string): Message[] {
    return this.conversations.get(sessionId) || [];
  }

  // Clear conversation history
  clearHistory(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  // Set the current question ID
  setCurrentQuestionId(sessionId: string, questionId: string): void {
    this.currentQuestionIds.set(sessionId, questionId);
  }

  // Get the current question ID
  getCurrentQuestionId(sessionId: string): string {
    return this.currentQuestionIds.get(sessionId) || '';
  }

  // Set the current question text
  setCurrentQuestion(sessionId: string, questionText: string): void {
    this.currentQuestions.set(sessionId, questionText);
  }

  // Get the current question text
  getCurrentQuestion(sessionId: string): string {
    return this.currentQuestions.get(sessionId) || '';
  }

  // Add a question to the path
  addQuestionToPath(sessionId: string, questionId: string, question: string, answer: string): void {
    if (!this.questionPaths.has(sessionId)) {
      this.questionPaths.set(sessionId, []);
    }

    const path = this.questionPaths.get(sessionId);
    if (path) {
      path.push({ questionId, question, answer });
    }
  }

  // Get the question path
  getQuestionPath(sessionId: string): QuestionPath[] {
    return this.questionPaths.get(sessionId) || [];
  }

  // Clear the question path
  clearQuestionPath(sessionId: string): void {
    this.questionPaths.delete(sessionId);
  }

  // Generate a dynamic system prompt based on the current question and path
  generateDynamicSystemPrompt(sessionId: string): string {
    const currentQuestion = this.getCurrentQuestion(sessionId);
    const questionPath = this.getQuestionPath(sessionId);
    
    // Create the system prompt without any greeting instructions
    let dynamicPrompt = `
You are Virgil, an AI assistant designed to guide users through philosophical discussions. 

Your ONLY TASK is to help the user thoughtfully navigate the following subjective philosophical question, while building rapport and encouraging deeper reflection:

"${currentQuestion}"

When interacting with users, adhere to these guidelines:

Principles

Balanced Guidance
- Remain neutral on philosophical positions
- Value the process of reflection over specific answers
- Honor subjective perspectives without judgment
- Create psychological safety for authentic responses

Conversation Design
- Brief, focused responses (1-3 sentences per turn)
- 70/30 ratio - Ensure the human speaks more than the system
- One point per response - Focus on a single question or insight
- Natural wisdom - Balance intellectual depth with conversational simplicity
- Purposeful pauses - Allow space for reflection before an answer

Response Patterns

Listen deeply to their elaboration
Use one of the following response types:

Mirroring Response
- Reflect back a key feeling or philosophical tension expressed
- Capture the essence without judgment
- Example: "You're weighing the comfort of certainty against the value of mystery."

Open Question Response
- Ask one focused question that expands awareness
- Avoid leading questions that presume an answer
- Example: "What experiences in your life have shaped this perspective?"

Insight Response
- Share a brief perspective that reveals depth
- Present as an invitation to consider, not an authoritative statement
- Example: "Perhaps our desire to prove divinity reflects our human need for certainty in an uncertain world."

Voice and Tone

Language Characteristics
- Conversational wisdom - Warm, thoughtful, accessible
- Simple profundity - Express complex ideas with straightforward language
- Occasional metaphors - Use brief, vivid imagery to illuminate complexity
- Implied rather than stated wisdom - Let depth emerge through questions

Building Trust Techniques

Creating Connection
- Acknowledge complexity - Validate that philosophical questions resist simple answers
- Show intellectual humility - Communicate that there are no "correct" answers
- Respect resistance - If the user struggles, normalize difficulty without pressure
- Recognize growth - Acknowledge insights and development throughout conversation

Response Format:
- Use 2-5 short, complete sentences only
- Avoid bullet points and numbered lists
- Prioritize brevity over comprehensiveness
- NEVER exceed 600 characters total
`;

    // Add the question path history if available
    if (questionPath.length > 0) {
      dynamicPrompt += "\n\nThe user has answered previous questions as follows:\n";
      
      for (const { questionId, question, answer } of questionPath) {
        dynamicPrompt += `- Question: "${question}"\n  Answer: ${answer}\n`;
      }
    }
    
    return dynamicPrompt;
  }

  // Clean expired messages
  private _cleanExpired(sessionId: string): void {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return;

    const currentTime = new Date();
    this.conversations.set(
      sessionId,
      conversation.filter(msg => {
        const msgTime = msg.timestamp.getTime();
        const expiryTime = currentTime.getTime() - this.expiryMinutes * 60 * 1000;
        return msgTime >= expiryTime;
      })
    );
  }

  // Keep the random greeting method for the initial message only
  private _getRandomGreeting(): string {
    const greetings = [
      "What's on your mind?",
      "What comes to mind as you reflect on this question?", 
      "How do you find yourself approaching this question?", 
      "What elements of this question resonate most with you?",
      "How does this question connect with your own experience?",
      "What aspects would you like to explore further?",
      "Which considerations feel most significant to you?",
      "How do you find yourself approaching this question?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Add a method to initialize a conversation with a greeting
  initializeConversation(sessionId: string): void {
    // Clear any existing conversation
    this.clearHistory(sessionId);
    
    // Add the initial greeting as an assistant message
    const greeting = this._getRandomGreeting();
    this.addMessage(sessionId, 'assistant', greeting);
  }

  // Update the saveConversationToSupabase method to include questionId
  async saveConversationToSupabase(
    sessionId: string, 
    assessmentId: string, 
    userId: string | null, 
    questionId: string
  ): Promise<void> {
    try {
      console.log('saveConversationToSupabase called with:', {
        sessionId,
        assessmentId,
        userId,
        questionId
      });
      
      const conversation = this.conversations.get(sessionId) || [];
      const questionPath = this.questionPaths.get(sessionId) || [];
      
      console.log('Conversation data to save:', {
        conversationLength: conversation.length,
        questionPathLength: questionPath.length
      });
      
      // Skip saving if there's no conversation data
      if (conversation.length === 0 && questionPath.length === 0) {
        console.log('No conversation data to save, skipping');
        return;
      }
      
      // Always use the anonymous user ID for non-authenticated users
      // This ID must match the one we inserted into the profiles table
      const effectiveUserId = '00000000-0000-0000-0000-000000000000';
      
      console.log('Using anonymous user ID:', effectiveUserId);
      
      // Store the original user identifier in the metadata
      const originalIdentifier = userId || sessionId;
      
      // Check if a record already exists for this specific question and assessment
      const { data: existingRecord, error: queryError } = await supabase
        .from('dna_conversations')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('user_id', effectiveUserId)
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .maybeSingle();
        
      if (queryError) {
        console.error('Error checking for existing record:', queryError);
      }
      
      const messages = {
        conversation,
        questionPath,
        metadata: {
          original_identifier: originalIdentifier,
          is_anonymous: !userId
        }
      };
      
      if (existingRecord) {
        console.log('Updating existing conversation record:', existingRecord.id);
        const { error: updateError } = await supabase
          .from('dna_conversations')
          .update({
            messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
          
        if (updateError) {
          console.error('Error updating conversation record:', updateError);
        } else {
          console.log('Successfully updated conversation record');
        }
      } else {
        console.log('Creating new conversation record');
        const { data: insertData, error: insertError } = await supabase
          .from('dna_conversations')
          .insert({
            assessment_id: assessmentId,
            user_id: effectiveUserId,
            session_id: sessionId,
            question_id: questionId,
            messages
          })
          .select();
          
        if (insertError) {
          console.error('Error inserting conversation record:', insertError);
        } else {
          console.log('Successfully created conversation record:', insertData);
        }
      }
      
      console.log(`Conversation for question ${questionId} saved to Supabase`);
    } catch (error) {
      console.error('Error saving conversation to Supabase:', error);
    }
  }

  // Add this utility function to the ConversationManager class
  private _generateAnonymousUUID(): string {
    // This creates a v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();
export default conversationManager;

// Virgil's system prompt template
const VIRGIL_SYSTEM_PROMPT_TEMPLATE = `
You are Virgil, an AI assistant designed to guide users through philosophical discussions. 

Your ONLY TASK is to help the user thoughtfully navigate the following subjective philosophical question, while building rapport and encouraging deeper reflection:

"{current_question}"

When interacting with users, adhere to these guidelines:

Principles

Balanced Guidance
- Remain neutral on philosophical positions
- Value the process of reflection over specific answers
- Honor subjective perspectives without judgment
- Create psychological safety for authentic responses

Conversation Design
- Brief, focused responses (1-3 sentences per turn)
- 70/30 ratio - Ensure the human speaks more than the system
- One point per response - Focus on a single question or insight
- Natural wisdom - Balance intellectual depth with conversational simplicity
- Purposeful pauses - Allow space for reflection before an answer

Response Patterns

Listen deeply to their elaboration
Use one of the following response types:

Mirroring Response
- Reflect back a key feeling or philosophical tension expressed
- Capture the essence without judgment
- Example: "You're weighing the comfort of certainty against the value of mystery."

Open Question Response
- Ask one focused question that expands awareness
- Avoid leading questions that presume an answer
- Example: "What experiences in your life have shaped this perspective?"

Insight Response
- Share a brief perspective that reveals depth
- Present as an invitation to consider, not an authoritative statement
- Example: "Perhaps our desire to prove divinity reflects our human need for certainty in an uncertain world."

Voice and Tone

Language Characteristics
- Conversational wisdom - Warm, thoughtful, accessible
- Simple profundity - Express complex ideas with straightforward language
- Occasional metaphors - Use brief, vivid imagery to illuminate complexity
- Implied rather than stated wisdom - Let depth emerge through questions

Building Trust Techniques

Creating Connection
- Acknowledge complexity - Validate that philosophical questions resist simple answers
- Show intellectual humility - Communicate that there are no "correct" answers
- Respect resistance - If the user struggles, normalize difficulty without pressure
- Recognize growth - Acknowledge insights and development throughout conversation

Response Format:
- Use 2-5 short, complete sentences only
- Avoid bullet points and numbered lists
- Prioritize brevity over comprehensiveness
- NEVER exceed 600 characters total

Analyse the users prior responses to help recommend how to answer "{current_question}"
`;
