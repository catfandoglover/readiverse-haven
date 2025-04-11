import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
// Import the Database type from the generated file
import { Database, Json } from '@/types/supabase';

// Assuming ChatMessage structure based on PRD FR4.2
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
  // Use the specific Database type for the client
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
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
  async fetchConversation(
    tableName: keyof Database['public']['Tables'],
    userId: string,
    contextIdentifiers: Record<string, any>
  ): Promise<{ data: Database['public']['Tables'][typeof tableName]['Row'] | null; error: Error | null }> {
    let query = this.supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId);

    Object.entries(contextIdentifiers).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error(`Error fetching conversation from ${String(tableName)}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    // Return the data directly, type inferred from Database schema
    return { data, error: null };
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
  async fetchConversationList(
    tableName: keyof Database['public']['Tables'],
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
      console.error(`Error fetching conversation list from ${String(tableName)}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    // Caller might need to type assert the returned data array
    return { data, error: null };
  }

  /**
   * Creates a new conversation record.
   * @param tableName The name of the Supabase table.
   * @param userId The user's ID (auth.uid()).
   * @param initialMessages The initial array of messages (can be empty).
   * @param metadata An object containing additional fields specific to the table (e.g., { book_id: 'xyz', prompt_id: '123' }).
   * @returns The newly created conversation object or throws an error.
   */
  async createConversation(
    tableName: keyof Database['public']['Tables'],
    userId: string,
    initialMessages: ChatMessage[],
    metadata: Record<string, any>
  ): Promise<{ data: Database['public']['Tables'][typeof tableName]['Row'] | null; error: Error | null }> {
    const now = new Date().toISOString();
    const last_message_preview = this.getLastMessagePreview(initialMessages);

    type TableInsert = Database['public']['Tables'][typeof tableName]['Insert'];

    const newConversationData: TableInsert = {
      user_id: userId,
      // Cast messages to suitable Json type (e.g., unknown[] or Json)
      messages: initialMessages as unknown as Json,
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
      console.error(`Error creating conversation in ${String(tableName)}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Updates an existing conversation, typically adding messages.
   * @param tableName The name of the Supabase table.
   * @param conversationId The ID of the conversation record to update.
   * @param updates An object containing fields to update. Must include `messages` array. Can include others like `status`, `progress_percentage`.
   * @returns The updated conversation object or throws an error.
   */
  async updateConversation(
    tableName: keyof Database['public']['Tables'],
    conversationId: string,
    updates: { messages: ChatMessage[] } & Record<string, any>
  ): Promise<{ data: Database['public']['Tables'][typeof tableName]['Row'] | null; error: Error | null }> {

    const updatePayload: Partial<Database['public']['Tables'][typeof tableName]['Update']> = {
      ...updates,
      // Cast messages to suitable Json type
      messages: updates.messages as unknown as Json,
      updated_at: new Date().toISOString(),
    };

    // Only add last_message_preview if the messages array is actually provided
    if (updates.messages) {
      updatePayload.last_message_preview = this.getLastMessagePreview(updates.messages);
    } else {
         console.warn(`Updating conversation ${conversationId} in ${String(tableName)} without providing 'messages' array.`);
         // Remove preview if messages aren't being updated? Or leave as is?
         // For now, we don't set it if messages are absent in the update.
         delete updatePayload.last_message_preview;
    }

    const { data, error } = await this.supabase
      .from(tableName)
      .update(updatePayload)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating conversation ${conversationId} in ${String(tableName)}:`, error);
       return { data: null, error: new Error(error.message) };
    }
    return { data, error: null };
  }

  /**
   * Deletes a specific conversation.
   * @param tableName The name of the Supabase table.
   * @param conversationId The ID of the conversation to delete.
   * @param userId The user's ID (auth.uid()) - used for RLS check implicitly.
   * @returns PostgrestError or null if successful.
   */
  async deleteConversation(
    tableName: keyof Database['public']['Tables'],
    conversationId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error(`Error deleting conversation ${conversationId} from ${String(tableName)}:`, error);
      return { error: new Error(error.message) };
    }
     return { error: null };
  }
}
