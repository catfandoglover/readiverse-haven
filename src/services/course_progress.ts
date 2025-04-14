import { SupabaseClient } from '@supabase/supabase-js';
import { ChatMessage } from './ConversationManager'; // Assuming ChatMessage is exported

// --- Constants ---
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// --- Helper Functions ---

/**
 * Formats the conversation history into a plain text string for the LLM prompt.
 * @param history - Array of chat messages.
 * @returns A formatted string representing the conversation.
 */
function formatConversationHistory(history: ChatMessage[]): string {
  if (!history || history.length === 0) {
    return 'No conversation history yet.';
  }
  return history
    .map(msg => `${msg.role === 'user' ? 'User' : 'Virgil'}: ${msg.content}`)
    .join('\n');
}

/**
 * Constructs the full prompt for the Gemini API.
 * @param formattedHistory - The formatted conversation history string.
 * @returns The complete prompt string.
 */
function constructPrompt(formattedHistory: string): string {
  // This is the course structure provided earlier. Keep it updated if the structure changes.
  const courseStructure = `
# Virgil Course Structure

### 1. Invocation (1 minute)
- Begin with a brief, poetic acknowledgment of the learning journey
- Reference where this module sits in the larger course
- Connect to the learner's stated motivations
- Pose an opening question that invites engagement

### 2. Textual Encounter (4 minutes)
- Present 1-2 brief, powerful excerpts from relevant texts (never more than 100 words each)
- Ask what stands out to the learner
- Mirror their response to deepen understanding
- Offer one brief insight that expands their observation

### 3. Concept Exploration (4 minutes)
- Introduce one central concept or idea
- Relate it to both the text and the learner's interests
- Ask one open question that applies this concept to their concerns
- Listen deeply and respond with a focus on implications

### 4. Dialectical Engagement (4 minutes)
- Introduce a tension, paradox, or counterpoint
- Invite the learner to wrestle with this complexity
- Respect their perspective while gently expanding the frame
- Offer a synthesis that honors multiple dimensions

### 5. Integration & Bridge (2 minutes)
- Ask how this learning connects to their life
- Highlight one key insight from the conversation
- Foreshadow the next module with a question that lingers
- Express gratitude for their engagement
`;

  return `Review this message history between the user and Virgil. Based on the provided course structure, assign a completion percentage to the course based on how far the conversation seems to have progressed through these stages.

${courseStructure}

Conversation History:
---
${formattedHistory}
---

Based *only* on the conversation history and the course structure, what percentage (0-100) of the course structure has the user likely completed?

**ONLY return a single integer number between 0 and 100.**`;
}

/**
 * Fetches the current progress percentage for a given conversation.
 * Returns 0 if not found or on error.
 */
async function getCurrentProgress(
  supabaseClient: SupabaseClient<any>,
  tableName: string,
  conversationId: string
): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('progress_percentage')
      .eq('id', conversationId)
      .maybeSingle(); // Use maybeSingle to handle null data gracefully

    if (error) {
      console.error(`[Progress] Error fetching current progress for ${conversationId}:`, error);
      return 0; // Default to 0 on error
    }

    return data?.progress_percentage ?? 0; // Default to 0 if null/undefined
  } catch (err) {
    console.error(`[Progress] Exception fetching current progress for ${conversationId}:`, err);
    return 0;
  }
}

/**
 * Updates the progress percentage in the database.
 */
async function updateProgressInDb(
    supabaseClient: SupabaseClient<any>,
    tableName: string,
    conversationId: string,
    newProgress: number
): Promise<void> {
    try {
        const { error } = await supabaseClient
            .from(tableName)
            .update({
                progress_percentage: newProgress,
                updated_at: new Date().toISOString(), // Also update timestamp
             })
            .eq('id', conversationId);

        if (error) {
            console.error(`[Progress] Error updating progress for ${conversationId} to ${newProgress}:`, error);
            // Optionally throw or handle specific error codes
        } else {
             console.log(`[Progress] Successfully updated progress for ${conversationId} to ${newProgress}`);
        }
    } catch (err) {
        console.error(`[Progress] Exception updating progress for ${conversationId}:`, err);
    }
}


// --- Main Exported Function ---

/**
 * Calculates the course progress percentage based on conversation history
 * using the Gemini API and updates it in the Supabase table.
 *
 * IMPORTANT: This function is designed for client-side use FOR NOW.
 * The API key is exposed. Move this logic and key usage to a secure
 * backend (Supabase Edge Function) as soon as possible.
 *
 * @param conversationHistory - The array of chat messages.
 * @param apiKey - The Google Gemini API key (VITE_ prefixed, exposed).
 * @param conversationId - The ID of the conversation row in Supabase.
 * @param tableName - The Supabase table name (e.g., 'virgil_course_conversations').
 * @param supabaseClient - An initialized Supabase client instance.
 */
export async function calculateAndStoreProgress(
  conversationHistory: ChatMessage[],
  apiKey: string,
  conversationId: string,
  tableName: string, // e.g., 'virgil_course_conversations'
  supabaseClient: SupabaseClient<any>
): Promise<void> {
  if (!apiKey) {
    console.warn('[Progress] Missing VITE_GOOGLE_GEMINI_API_KEY. Skipping progress calculation.');
    return;
  }
  if (!conversationId || !tableName || !supabaseClient) {
      console.error('[Progress] Invalid arguments provided to calculateAndStoreProgress.');
      return;
  }

  console.log(`[Progress Debug] calculateAndStoreProgress called for conversation ${conversationId}`);
  console.log(`[Progress Debug] History contains ${conversationHistory.length} messages`);

  const formattedHistory = formatConversationHistory(conversationHistory);
  const prompt = constructPrompt(formattedHistory);
  console.log(`[Progress Debug] Prompt constructed (${prompt.length} chars)`);

  try {
    console.log(`[Progress Debug] Sending request to Gemini API (${GEMINI_API_ENDPOINT})`);
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
             // Requesting a small number of tokens as we only expect digits
             maxOutputTokens: 10,
             // Lower temperature for more deterministic, numerical output
             temperature: 0.7,
             // Optional: Stop sequences if the model tends to add extra text
             // stopSequences: ["%"]
         }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Progress] Gemini API request failed (${response.status}):`, errorBody);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Progress Debug] Received Gemini API response:`, data);

    // Safely access the text content
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`[Progress Debug] Raw text result: "${textResult}"`);

    if (typeof textResult !== 'string') {
        console.warn('[Progress] Unexpected response format from Gemini API:', data);
        return; // Exit if response format is wrong
    }

    // Attempt to parse the percentage, removing potential whitespace or stray characters
    const cleanedText = textResult.trim().replace(/[^0-9]/g, ''); // Keep only digits
    const newProgressPercentage = parseInt(cleanedText, 10);
    console.log(`[Progress Debug] Cleaned text: "${cleanedText}", Parsed percentage: ${newProgressPercentage}`);

    if (isNaN(newProgressPercentage) || newProgressPercentage < 0 || newProgressPercentage > 100) {
      console.warn(`[Progress] Invalid percentage received from Gemini API: "${textResult}". Parsed as: ${newProgressPercentage}`);
      return; // Exit if validation fails
    }

    console.log(`[Progress] Gemini suggested progress: ${newProgressPercentage}%`);

    // Fetch current progress and update only if the new percentage is higher
    const currentProgress = await getCurrentProgress(supabaseClient, tableName, conversationId);
    console.log(`[Progress Debug] Current progress: ${currentProgress}%, New suggestion: ${newProgressPercentage}%`);
    const finalProgress = Math.max(currentProgress, newProgressPercentage);

    if (finalProgress > currentProgress) {
      console.log(`[Progress] Current progress is ${currentProgress}%. Updating to ${finalProgress}%.`);
      await updateProgressInDb(supabaseClient, tableName, conversationId, finalProgress);
      console.log(`[Progress Debug] Database update completed for progress: ${finalProgress}%`);
    } else {
      console.log(`[Progress] New progress (${newProgressPercentage}%) is not higher than current (${currentProgress}%). No update needed.`);
    }

  } catch (error) {
    console.error('[Progress] Error during progress calculation or update:', error);
    // Non-blocking error: Log it, but don't crash the main chat flow.
  }
}
