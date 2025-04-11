## Product Requirements Document (PRD): Virgil Chat System V2 (Updated)

**1. Introduction**

This document outlines the requirements for refactoring and expanding the Virgil chatbot system. The goal is to support multiple distinct Virgil chatbot instances across different parts of the application (e.g., general chat, e-reader, courses, exams) while maximizing code reusability, maintaining UI consistency where appropriate, and ensuring data separation for different conversation contexts. This PRD is intended for the engineering team, specifically targeting a junior developer for implementation.

**2. Goals**

*   **Reusability:** Implement a core chat engine (UI, AI interaction, state management) that is reused across all Virgil instances.
*   **Configurability:** Allow each Virgil instance to have its own distinct system prompt and dedicated conversation storage location (Supabase table).
*   **Maintainability:** Structure the code so that adding new Virgil instances or modifying existing ones is straightforward and localized, primarily through configuration changes.
*   **Data Isolation:** Ensure conversation history from different contexts (e.g., reading a specific book vs. taking a course) is stored and retrieved separately using dedicated tables.
*   **UI Consistency:** Maintain a consistent core chat UI look and feel, while supporting two primary layouts: full-screen and drawer.
*   **Foundation:** Establish a robust foundation for future features like conversation summarization (compact) and advanced analysis.

**3. Non-Goals**

*   Implementing the "compact" summarization feature (though the structure should facilitate it later).
*   Implementing Stripe integration or paywall logic.
*   Building the DNA Assessment UI flow itself (focus is on the chat component *within* it, using the 'drawer' style).
*   Major UI redesign of the core chat elements (leverage existing styles/components).
*   Implementing the server-side logic for embedding search (this PRD focuses on the Virgil chat interactions).

**4. Virgil Instances Overview**

The following distinct Virgil instances need to be supported:

1.  **General Chat (Virgil's Office):**
    *   Accessed via "Chat with Virgil" in Virgil's Office.
    *   Presents multiple modalities (e.g., "Grow My Mind", "Read Closely", "Debug My Thinking").
    *   **UI:** Full-screen.
    *   **Prompt:** Fetched from `prompts` table based on selected modality (`prompt_id`).
    *   **Storage:** Shared table (`virgil_general_chat_conversations`), tagged with `prompt_id`.
    *   **History:** Sidebar shows *all* conversations from this table for the user, identified by icons (`icon_display` field from `prompts` table via `prompt_id`). Resuming a conversation uses the original modality's prompt.
2.  **Reader Chat:**
    *   Accessed from within the e-reader interface for a specific book.
    *   **UI:** Drawer.
    *   **Prompt:** Specific to assisting with the current book (potentially generic + book title/context).
    *   **Storage:** Dedicated table (`virgil_reader_conversations`), tagged with `book_id`. Unique constraint ensures only one conversation per user per book.
    *   **History:** One continuous conversation per book. Re-opening chat for the same book resumes the *full* previous conversation history.
3.  **Course Chat:**
    *   Accessed within a specific course context.
    *   **UI:** Full-screen.
    *   **Prompt:** Specific to the course content/goals (fetched based on `course_id`).
    *   **Storage:** Dedicated table (`virgil_course_conversations`), tagged with `course_id`.
    *   **History:** Resuming chat within a course should load the full history and potentially use/update the `progress_percentage`. History view likely scoped to the course context.
4.  **Exam Chat (Test My Knowledge / Badges):**
    *   Accessed when starting an exam/badge attempt.
    *   **UI:** Full-screen.
    *   **Prompt:** Specific exam prompt (fetched from `prompts` table based on `exam_id`).
    *   **Storage:** Dedicated table (`virgil_exam_conversations`), tagged with `exam_id`.
    *   **History:** Each attempt is a *new* conversation record. No resuming previous attempts. Conversation saved upon completion, status updated.
    *   **Post-Processing:** Requires a separate grading step after conversation completion (`status='completed'`) to generate a `score`, update `status` to `'graded'`, and potentially create a `badges` entry.
5.  **Welcome Chat (Post-DNA / Kill Time):**
    *   Accessed potentially after DNA assessment or as an intro experience.
    *   **UI:** Full-screen (assumption, confirm if needed).
    *   **Prompt:** Specific welcome/introductory prompt (fetched from `prompts` table via a 'welcome' `prompt_id`).
    *   **Storage:** Use `virgil_general_chat_conversations`, tagged with a specific 'welcome' `prompt_id`.
    *   **History:** Treat like any other general chat conversation.

**5. Functional Requirements**

**5.1. Core Architecture:**

*   **FR1.1:** Implement a central `AIService.ts` responsible *only* for communicating with the Gemini API (sending prompt+history, receiving response, potentially basic error handling).
*   **FR1.2:** Implement the `ConversationManager.ts` class as the single point of interaction with Supabase for conversation data.
    *   It must be instantiated with the Supabase client.
    *   It provides parameterized methods for CRUD operations:
        *   `fetchConversation<T>(tableName, userId, contextIdentifiers)`: Retrieves a single conversation based on context (e.g., user+book, user+course).
        *   `fetchConversationList<T>(tableName, userId, selectFields, limit, orderBy)`: Retrieves multiple conversation previews for history lists.
        *   `createConversation<T>(tableName, userId, initialMessages, metadata)`: Creates a new conversation record, including context identifiers (e.g., `book_id`, `course_id`, `prompt_id`) passed via `metadata`.
        *   `updateConversation<T>(tableName, conversationId, updates)`: Updates an existing conversation's `messages`, `last_message_preview`, `updated_at`, and potentially other metadata fields (`progress_percentage`, `status`).
        *   `deleteConversation(tableName, conversationId, userId)`: Deletes a specific conversation.
    *   It handles the `ChatMessage[]` structure for the `messages` field.
    *   It automatically calculates and updates `last_message_preview` and `updated_at`.
*   **FR1.3:** Implement/Refactor `useVirgilChat.ts` hook to manage the core chat logic: message state (`ChatMessage[]`), user input handling, calling `AIService`, and calling the appropriate `ConversationManager` methods (fetch, create, update). It must be initializable with a `systemPrompt`, `storageTable` identifier, `userId`, `contextIdentifiers` (e.g., `{ course_id: 'xyz' }`), and instances of `ConversationManager` and `AIService`.
*   **FR1.4:** Create/Refactor a core `VirgilChatUI.tsx` component responsible for rendering the chat interface (messages, input bar) based on props/state from `useVirgilChat`. This component should be layout-agnostic.
*   **FR1.5:** Implement layout-specific wrapper components (`VirgilFullScreenWrapper.tsx`, `VirgilDrawerWrapper.tsx`) that render `VirgilChatUI` and handle fetching the correct configuration (prompt, storage target, context identifiers) based on context (route, mode, book, etc.) and initializing `useVirgilChat`.
*   **FR1.6:** (Recommended) Create a central configuration file/object (`virgilConfig.ts`) mapping Virgil instance types (e.g., `COURSE`, `READER`) to their configurations (storage table name, prompt fetching logic, UI layout, context key like `course_id` or `book_id`, specific flags like `requiresGrading`).

**5.2. UI Requirements:**

*   **FR2.1:** The core chat interface (`VirgilChatUI`) must display user and assistant messages clearly, handle loading states, and provide a text input with a send button.
*   **FR2.2:** Include a microphone icon/button for initiating voice input (integration with transcription service is assumed to exist or be handled by `useVirgilChat`/`AIService`).
*   **FR2.3:** The `VirgilFullScreenWrapper` must render the chat UI taking up the main content area, potentially alongside the existing conversation history sidebar.
*   **FR2.4:** The `VirgilDrawerWrapper` must render the chat UI within a drawer component that overlays or sits alongside other content (like the e-reader text or DNA assessment questions). Styling should match the existing drawer implementations.

**5.3. Prompt Management:**

*   **FR3.1:** General Chat modalities must fetch their system prompts from the `prompts` Supabase table based on the selected modality ID (`prompt_id`).
*   **FR3.2:** Reader, Course, and Exam chats must use system prompts specific to their context (book, course, exam). Logic for fetching/generating these prompts will reside in the respective wrapper components or be defined in the config.
*   **FR3.3:** The user should not see the system prompt itself in the chat interface. The conversation should start with the user's first message or Virgil's first response after the system prompt.

**5.4. Conversation Management:**

*   **FR4.1:** Each Virgil instance type must store its conversation history in its designated Supabase table (see Section 7: Data Schema).
*   **FR4.2:** Conversation history (`messages` column) must be stored as a JSONB array of objects: `{ role: 'user' | 'assistant', content: string }`.
*   **FR4.3:** Conversations should be saved/updated efficiently. **Decision:** Call `ConversationManager.updateConversation` after *each* assistant response is received (and potentially after user message sent, TBD based on UX preference for unsent state), passing the *full* updated `messages` array. This ensures minimal data loss if the user closes the browser abruptly.
*   **FR4.4:** When initiating a chat for contexts allowing resumption (Reader, Course, General Chat), `useVirgilChat` must call `ConversationManager.fetchConversation` using the correct `tableName`, `userId`, and `contextIdentifiers` (e.g., `{ book_id: 'abc' }`).
*   **FR4.5:** If `fetchConversation` returns an existing conversation, `useVirgilChat` must be initialized with the full `messages` history and `conversationId` from that record.
*   **FR4.6:** For non-resumable contexts (Exam Chat), `useVirgilChat` must ensure a *new* conversation record is created via `ConversationManager.createConversation` every time the chat is initiated.
*   **FR4.7:** The conversation history sidebar component (`ConversationHistorySidebar`) needs adaptation:
    *   When in Virgil's Office (General Chat context), it calls `ConversationManager.fetchConversationList` targeting `virgil_general_chat_conversations`, selecting fields like `id`, `last_message_preview`, `updated_at`, and `prompt_id`. It must then join or separately query `prompts` using the `prompt_id` to get the `icon_display` for display.
    *   When in a Course context, it should ideally call `fetchConversationList` targeting `virgil_course_conversations` for that specific `course_id` (or maybe just show course title, TBD UI).
    *   When in the Reader, it might not be displayed, or could show previous chats for *other* books (Simplify for now: sidebar primarily for Fullscreen modes).
    *   Clicking a conversation in the sidebar should load that conversation into the main chat view by re-initializing `useVirgilChat` with the selected `conversationId`, its history, and original system prompt (fetched using the stored `prompt_id` or context identifier).

**5.5. AI Integration:**

*   **FR5.1:** All interactions with the LLM must go through the central `AIService.ts`.
*   **FR5.2:** `useVirgilChat` must pass the correct `systemPrompt` and the current `messages` history to `AIService` for generating responses.

**5.6. Specific Instance Behaviors:**

*   **FR6.1 (Courses):** Store a `progress_percentage` field (nullable integer 0-100) in `virgil_course_conversations`. The logic for *calculating* this percentage is out of scope for this PRD, but `useVirgilChat` (or the wrapper) should pass it to `ConversationManager.updateConversation` if it needs updating.
*   **FR6.2 (Exams):**
    *   Do not allow resuming exam conversations (handled by always creating new ones, FR4.6).
    *   `useVirgilChat` (or wrapper) should update the `status` field in `virgil_exam_conversations` to `'completed'` via `ConversationManager.updateConversation` upon graceful exit/conclusion.
    *   Implement a *separate* function/process (e.g., a Supabase Edge Function triggered manually or by status change) that:
        *   Takes a `conversationId` for an `exam_conversations` record with `status = 'completed'`.
        *   Fetches the `messages` and `exam_id`.
        *   Fetches the `grading_rubric` from the `prompts` table using `exam_id`.
        *   Calls the LLM (`AIService` or separate) with the rubric and messages to get a score.
        *   Updates the `virgil_exam_conversations` record with the calculated `score` and sets `status` to `'graded'`.
        *   Upon successful grading, creates an entry in the `badges` table.

**6. Technical Design Considerations**

*   Leverage the existing component library for UI elements.
*   Use TypeScript extensively for type safety.
*   Implement clear loading indicators and user feedback for API/DB operations and errors.
*   Ensure Supabase Row Level Security (RLS) is properly configured for all new tables (see Section 7 examples).
*   Consider creating a singleton instance or context provider for `ConversationManager` and `AIService` for easy access throughout the app.

**7. Data Schema (Supabase Tables)**

*(Note: SQL definitions are simplified as requested - no comments, triggers, or explicit indexes. RLS policies are still included as they are crucial for security.)*

**7.1. `prompts`**
*   Stores system prompts, icons, categories, display info, and grading rubrics, based on existing table structure.

```sql
CREATE TABLE public.prompts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- Assuming UUID PK, adjust if existing uses integer
    context text,
    purpose text,
    prompt text NOT NULL,
    section text,
    display_order integer,
    user_title text,
    user_subtitle text,
    icon_display text,
    grading_rubric text, -- Kept for exam functionality
    created_at timestamp with time zone DEFAULT now(), -- Added for consistency
    updated_at timestamp with time zone DEFAULT now()  -- Added for consistency
);

-- RLS: Typically prompts might be public read, restricted write. Define as needed.
-- ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access to prompts" ON public.prompts FOR SELECT USING (true);
-- CREATE POLICY "Allow admin write access to prompts" ON public.prompts FOR ALL USING (is_admin_user()); -- Example admin check
```

**7.2. `virgil_general_chat_conversations`**
*   Stores history for the various modalities in Virgil's Office.

```sql
CREATE TABLE public.virgil_general_chat_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    prompt_id uuid NOT NULL,
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    last_message_preview text,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_prompt FOREIGN KEY(prompt_id) REFERENCES public.prompts(id) ON DELETE RESTRICT
);

ALTER TABLE public.virgil_general_chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users select/insert/update/delete own general chat convos" ON public.virgil_general_chat_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**7.3. `virgil_reader_conversations`**
*   Stores history for book chats (one conversation per user per book).

```sql
CREATE TABLE public.virgil_reader_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    book_id text NOT NULL,
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    last_message_preview text,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT reader_user_book_unique UNIQUE (user_id, book_id)
);

ALTER TABLE public.virgil_reader_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users select/insert/update/delete own reader convos" ON public.virgil_reader_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**7.4. `virgil_course_conversations`**
*   Stores history for course interactions.

```sql
CREATE TABLE public.virgil_course_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    progress_percentage integer,
    last_message_preview text,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT check_progress_percentage CHECK (progress_percentage IS NULL OR (progress_percentage >= 0 AND progress_percentage <= 100))
);

ALTER TABLE public.virgil_course_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users select/insert/update/delete own course convos" ON public.virgil_course_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**7.5. `virgil_exam_conversations`**
*   Stores the conversation that constitutes an exam attempt.

```sql
CREATE TABLE public.virgil_exam_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    messages jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'grading', 'graded', 'error')),
    score integer,
    last_message_preview text,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_prompt FOREIGN KEY(exam_id) REFERENCES public.prompts(id) ON DELETE RESTRICT
);

ALTER TABLE public.virgil_exam_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users select/insert/update own exam convos" ON public.virgil_exam_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**7.6. `badges`**
*   Stores the earned badges after successful exam grading.

```sql
CREATE TABLE public.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    conversation_id uuid NOT NULL UNIQUE,
    earned_at timestamp with time zone NOT NULL DEFAULT now(),
    score integer NOT NULL,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_prompt FOREIGN KEY(exam_id) REFERENCES public.prompts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_exam_conversation FOREIGN KEY(conversation_id) REFERENCES public.virgil_exam_conversations(id) ON DELETE RESTRICT
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to select own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
```

**8. Open Questions / Future Considerations**

*   How exactly is Course progress (`progress_percentage`) determined and passed to the chat system?
*   Specific UI/UX for handling API errors or long loading times.
*   How should the "Welcome" chat be triggered?
*   Refining the Reader chat prompt generation (is book title enough context? Fetch from `books` table?).
*   Mechanism for displaying earned badges (out of scope for chat implementation, but related).
*   Detailed RLS policy review for edge cases (e.g., admin access, service roles for grading).
*   Confirm data type for `prompts.id` if existing table uses integer.

**9. Acceptance Criteria**

*   **AC1:** User can initiate a "General Chat" from Virgil's office, select a modality, have a conversation, close it, and resume the *same* conversation later from the history sidebar (showing correct icon). History saved/retrieved from `virgil_general_chat_conversations` via `ConversationManager`.
*   **AC2:** User can open a book, initiate the Virgil chat drawer, have a conversation, close it, reopen the *same* book, and the *full* conversation history is restored. History saved/retrieved from `virgil_reader_conversations` linked to `book_id` via `ConversationManager`. Unique constraint prevents multiple conversations per user/book.
*   **AC3:** User can start a "Test My Knowledge" exam, have the conversation guided by the exam prompt, and upon completion, the conversation is saved in `virgil_exam_conversations` with `status='completed'`. Starting the same exam again creates a *new* conversation record via `ConversationManager`.
*   **AC4:** A separate (manually triggerable for testing) grading function/process exists that takes a completed `virgil_exam_conversations.id`, processes it using the `prompts.grading_rubric`, updates the record (`score`, `status`='graded'), and creates a `badges` entry.
*   **AC5:** User can participate in a Course chat, and the conversation is saved in `virgil_course_conversations` linked to the `course_id`. Resuming works correctly via `ConversationManager`. `progress_percentage` can be updated.
*   **AC6:** Core logic (`AIService`, `useVirgilChat`, `VirgilChatUI`) and data access (`ConversationManager`) are demonstrably reused across the different Virgil instances.
*   **AC7:** Configuration for different Virgil types (storage table, prompt source, context key) is centralized (`virgilConfig.ts`) or clearly managed within wrapper components.
*   **AC8:** Both full-screen and drawer UI layouts are implemented and used in the correct contexts.
*   **AC9:** All new tables have appropriate RLS policies implemented, ensuring users can only access their own data.

**10. Implementation Prioritization (Suggested Order)**

1.  **Foundation - Core Services:**
    *   Implement/Finalize `AIService.ts`.
    *   Implement `ConversationManager.ts` (without token logic).
    *   Create singleton/provider instances for these services.
2.  **Foundation - Data Structure:**
    *   Ensure the `prompts` table schema matches the required fields (update existing table if necessary). Populate with essential prompts.
3.  **Foundation - Core Chat Logic & UI:**
    *   Implement/Refactor `useVirgilChat.ts` (without token logic).
    *   Implement/Refactor `VirgilChatUI.tsx`.
4.  **First Instance - General Chat:**
    *   Create `virgil_general_chat_conversations` table.
    *   Implement `VirgilFullScreenWrapper.tsx`.
    *   Implement `virgilConfig.ts` (or equivalent config logic within wrapper) for `GENERAL_CHAT`.
    *   Integrate General Chat end-to-end (fetching prompts, using `useVirgilChat`, saving/loading via `ConversationManager`).
    *   Update `ConversationHistorySidebar` to fetch from `virgil_general_chat_conversations` and display icons.
5.  **Second Instance - Reader Chat:**
    *   Create `virgil_reader_conversations` table.
    *   Implement `VirgilDrawerWrapper.tsx`.
    *   Add `READER_CHAT` config to `virgilConfig.ts`.
    *   Integrate Reader Chat end-to-end (drawer UI, `book_id` context, unique conversation logic).
6.  **Third Instance - Course Chat:**
    *   Create `virgil_course_conversations` table.
    *   Add `COURSE_CHAT` config to `virgilConfig.ts`.
    *   Integrate Course Chat using `VirgilFullScreenWrapper` (pass `course_id` context, handle `progress_percentage` if logic is available).
7.  **Fourth Instance - Exam Chat & Badges:**
    *   Create `virgil_exam_conversations` table.
    *   Create `badges` table.
    *   Add `EXAM_CHAT` config to `virgilConfig.ts`.
    *   Integrate Exam Chat using `VirgilFullScreenWrapper` (pass `exam_id`, ensure *new* conversation each time, update `status` to 'completed').
    *   Implement the separate grading function/process (potentially as a Supabase Edge Function) to update status/score and create `badges`.
8.  **Final Instance - Welcome Chat:**
    *   Ensure a 'welcome' prompt exists in the `prompts` table.
    *   Integrate Welcome Chat using `VirgilFullScreenWrapper` and the `GENERAL_CHAT` storage (`virgil_general_chat_conversations` table), passing the specific 'welcome' `prompt_id`.
9.  **Testing & Refinement:** Thoroughly test all instances, edge cases, error handling, and RLS policies. Refine UI/UX based on testing.

---
