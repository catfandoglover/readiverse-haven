import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
// No Database or Json import needed when using <any>
// import { Database, Json } from '@/types/supabase';

// Base ChatMessage type
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generic type for conversation metadata - defines the common structure
// expected by the manager. Specific table types are inferred via Database type.
interface ConversationBase {
  id: string;
  user_id: string;
  messages: ChatMessage[]; // Ensure this matches the JSONB structure
  created_at: string;
  updated_at: string;
  last_message_preview: string | null;
}

// Example specific conversation type - others would extend ConversationBase
// interface GeneralChatConversation extends ConversationBase {
//   prompt_id: string;
// }
// interface ReaderConversation extends ConversationBase {
//   book_id: string;
// }
// etc.

export class ConversationManager {
  // Use <any> to bypass schema type checking
  private supabase: SupabaseClient<any>;

  constructor(supabaseClient: SupabaseClient<any>) {
    this.supabase = supabaseClient;
  }

  private getLastMessagePreview(messages: ChatMessage[]): string | null {
    if (!messages || messages.length === 0) {
      return null;
    }
    const lastMessage = messages[messages.length - 1];
    // Truncate preview if necessary (e.g., 100 characters)
    const preview = lastMessage.content.substring(0, 100);
    return preview === lastMessage.content ? preview : `${preview}...`;
  }

  /**
   * Fetches a single conversation.
   */
  async fetchConversation(
    tableName: string, // Revert to simple string
    userId: string,
    contextIdentifiers: Record<string, any>
  ): Promise<{ data: any | null; error: Error | null }> { // Return type is any
    let query = this.supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId);

    Object.entries(contextIdentifiers).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error(`Error fetching conversation from ${tableName}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Fetches a list of conversation previews.
   */
  async fetchConversationList(
    tableName: string, // Revert to simple string
    userId: string,
    selectFields: string = 'id, updated_at, last_message_preview',
    limit: number = 50,
    orderBy: string = 'updated_at',
    ascending: boolean = false
  ): Promise<{ data: any[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select(selectFields)
      .eq('user_id', userId)
      .order(orderBy, { ascending })
      .limit(limit);

    if (error) {
      console.error(`Error fetching conversation list from ${tableName}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Creates a new conversation record.
   */
  async createConversation(
    tableName: string, // Revert to simple string
    userId: string,
    initialMessages: ChatMessage[],
    metadata: Record<string, any>
  ): Promise<{ data: any | null; error: Error | null }> { // Return type is any
    const now = new Date().toISOString();
    const last_message_preview = this.getLastMessagePreview(initialMessages);

    // No TableInsert type needed
    const newConversationData = {
      user_id: userId,
      messages: initialMessages, // No casting needed
      created_at: now,
      updated_at: now,
      last_message_preview: last_message_preview,
      ...metadata,
    };

    const { data, error } = await this.supabase
      .from(tableName)
      .insert(newConversationData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating conversation in ${tableName}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Updates an existing conversation.
   */
  async updateConversation(
    tableName: string, 
    conversationId: string,
    updates: { messages?: ChatMessage[] } & Record<string, any> // Make messages optional for updates that don't include it
  ): Promise<{ data: any | null; error: Error | null }> {
    
    const updatePayload: Record<string, any> = {
      ...updates, // Include all provided updates
      updated_at: new Date().toISOString(),
    };

    // Remove the messages field itself from the payload if it exists,
    // as it's often large and already handled by the DB structure. 
    // The caller should ensure `messages` is part of the base `updates` if it *needs* to be updated.
    // Typically, we only update metadata or timestamps here.
    if ('messages' in updatePayload) {
        // Optionally calculate preview IF messages are provided AND the column exists
        // updatePayload.last_message_preview = this.getLastMessagePreview(updatePayload.messages);
        // delete updatePayload.messages; // Decide if you want to delete messages from payload
    }
    // Remove the specific assignment for last_message_preview entirely
    // as the column doesn't exist.
    delete updatePayload.last_message_preview; 

    // Check if progress_percentage is included and ensure it's valid
    if (tableName === 'virgil_course_conversations' && 'progress_percentage' in updatePayload) {
        updatePayload.progress_percentage = Math.max(0, Math.min(100, Math.round(updatePayload.progress_percentage ?? 0)));
    } else if (tableName === 'virgil_course_conversations') {
         // If updating course convo without progress, remove it from payload to avoid errors
         // if it happened to be in the 'updates' object mistakenly.
         delete updatePayload.progress_percentage;
    }

    // Prevent trying to update messages directly if it was accidentally passed
    // and not handled above (safer approach)
    // delete updatePayload.messages; // REMOVE THIS LINE TO ALLOW MESSAGES UPDATE

    // Filter out undefined values to avoid Supabase errors
    Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

    const { data, error } = await this.supabase
      .from(tableName)
      .update(updatePayload)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating conversation ${conversationId} in ${tableName}:`, error);
       return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Deletes a specific conversation.
   */
  async deleteConversation(
    tableName: string, // Revert to simple string
    conversationId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error(`Error deleting conversation ${conversationId} from ${tableName}:`, error);
      return { error: new Error(error.message) };
    }
     return { error: null };
  }
}
