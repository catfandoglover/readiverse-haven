import { SupabaseClient } from '@supabase/supabase-js';

// Assuming ChatMessage structure based on PRD FR4.2
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generic type for conversation metadata, specific fields vary by table
interface ConversationBase {
  id: string;
  user_id: string;
  messages: ChatMessage[];
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
  // Revert to non-generic SupabaseClient type
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
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
   * Fetches a single conversation based on context identifiers.
   * @param tableName The name of the Supabase table (e.g., 'virgil_reader_conversations').
   * @param userId The user's ID (auth.uid()).
   * @param contextIdentifiers An object containing key-value pairs to match (e.g., { book_id: 'xyz' }, { course_id: 'abc' }).
   * @returns The conversation object or null if not found, or throws an error.
   */
  async fetchConversation<T extends ConversationBase>(
    tableName: string,
    userId: string,
    contextIdentifiers: Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> {
    const query = this.supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId);

    Object.entries(contextIdentifiers).forEach(([key, value]) => {
      query.eq(key, value);
    });

    query.limit(1).maybeSingle();
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching conversation from ${tableName}:`, error);
    }
    return { data: data as T | null, error: error ? new Error(error.message) : null };
  }

  /**
   * Fetches a list of conversation previews for history display.
   * @param tableName The name of the Supabase table.
   * @param userId The user's ID (auth.uid()).
   * @param selectFields String of fields to select (e.g., 'id, updated_at, last_message_preview, prompt_id'). Defaults to common fields.
   * @param limit Max number of conversations to fetch. Defaults to 50.
   * @param orderBy Field to order by. Defaults to 'updated_at'.
   * @param ascending Order direction. Defaults to false (descending).
   * @returns An array of partial conversation objects or throws an error.
   */
  async fetchConversationList<T extends Partial<ConversationBase>>(
    tableName: string,
    userId: string,
    selectFields: string = 'id, updated_at, last_message_preview',
    limit: number = 50,
    orderBy: string = 'updated_at',
    ascending: boolean = false
  ): Promise<{ data: T[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select(selectFields)
      .eq('user_id', userId)
      .order(orderBy, { ascending })
      .limit(limit);

    if (error) {
      console.error(`Error fetching conversation list from ${tableName}:`, error);
    }
    return { data: data as T[] | null, error: error ? new Error(error.message) : null };
  }

  /**
   * Creates a new conversation record.
   * @param tableName The name of the Supabase table.
   * @param userId The user's ID (auth.uid()).
   * @param initialMessages The initial array of messages (can be empty).
   * @param metadata An object containing additional fields specific to the table (e.g., { book_id: 'xyz', prompt_id: '123' }).
   * @returns The newly created conversation object or throws an error.
   */
  async createConversation<T extends ConversationBase>(
    tableName: string,
    userId: string,
    initialMessages: ChatMessage[],
    metadata: Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> {
    const now = new Date().toISOString();
    const last_message_preview = this.getLastMessagePreview(initialMessages);
    const newConversationData = {
      user_id: userId,
      messages: initialMessages,
      created_at: now,
      updated_at: now,
      last_message_preview: last_message_preview,
      ...metadata, // Include context identifiers like book_id, course_id, etc.
    };

    const { data, error } = await this.supabase
      .from(tableName)
      .insert(newConversationData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating conversation in ${tableName}:`, error);
    }
    return { data: data as T | null, error: error ? new Error(error.message) : null };
  }

  /**
   * Updates an existing conversation, typically adding messages.
   * @param tableName The name of the Supabase table.
   * @param conversationId The ID of the conversation record to update.
   * @param updates An object containing fields to update. Must include `messages` array. Can include others like `status`, `progress_percentage`.
   * @returns The updated conversation object or throws an error.
   */
  async updateConversation<T extends ConversationBase>(
    tableName: string,
    conversationId: string,
    updates: { messages: ChatMessage[] } & Record<string, any>
  ): Promise<{ data: T | null; error: Error | null }> {

    if (!updates.messages) {
         console.warn(`Updating conversation ${conversationId} in ${tableName} without providing 'messages' array.`);
    }

    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
      last_message_preview: this.getLastMessagePreview(updates.messages || []), // Calculate preview from provided messages
    };


    const { data, error } = await this.supabase
      .from(tableName)
      .update(updatePayload)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating conversation ${conversationId} in ${tableName}:`, error);
    }
    return { data: data as T | null, error: error ? new Error(error.message) : null };
  }

  /**
   * Deletes a specific conversation.
   * @param tableName The name of the Supabase table.
   * @param conversationId The ID of the conversation to delete.
   * @param userId The user's ID (auth.uid()) - used for RLS check implicitly.
   * @returns PostgrestError or null if successful.
   */
  async deleteConversation(
    tableName: string,
    conversationId: string,
    userId: string // Keep userId param for potential future checks, though RLS handles primary auth
  ): Promise<{ error: Error | null }> {

     // Basic check to prevent accidental deletion if userId doesn't match, although RLS is the main guard
     // const { data: checkData, error: checkError } = await this.supabase
     //    .from(tableName)
     //    .select('id')
     //    .eq('id', conversationId)
     //    .eq('user_id', userId)
     //    .maybeSingle();
     //
     // if (checkError || !checkData) {
     //     console.error(`Pre-delete check failed or conversation ${conversationId} not found/owned by user ${userId} in ${tableName}.`, checkError);
     //     return { error: checkError ?? { message: "Conversation not found or access denied.", details: "", hint:"", code: "404" } };
     // }


    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', conversationId);
      // RLS policy should enforce ownership based on auth.uid() matching user_id column

    if (error) {
      console.error(`Error deleting conversation ${conversationId} from ${tableName}:`, error);
    }

     return { error: error ? new Error(error.message) : null };
  }
}
