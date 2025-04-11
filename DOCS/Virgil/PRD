Okay, this is a great set of requirements and context. Let's first think through the ideal structure based on your principles (reusability, separate storage, separate prompts, shared core AI, consistent UI).

## Ideal Structure Thinking

Here’s how I would approach structuring the different Virgil instances to meet your goals:

1.  **Core Services Layer (Highly Reusable):**
    *   `AIService.ts`: This remains central and unchanged. It handles the raw interaction with the Gemini API (sending prompts + history, receiving responses). It should be unaware of *which* Virgil instance is calling it, simply performing the AI task. It should also handle token counting and potentially return that info with the response.
    *   `ConversationManager.ts`: This needs to be refactored slightly. Instead of being hardcoded to one table (`virgil_conversations` or `dna_conversations`), it should be instantiated or called with parameters indicating *which* Supabase table to use for storage and potentially the schema/structure expected for that table (e.g., columns like `book_id`, `course_id`, `mode_id`). It will handle CRUD operations (Create, Read, Update, Delete) for conversation histories in the designated tables.
    *   `SupabaseClient.ts`: Remains the single point of interaction with the database.

2.  **Core Chat Logic Hook (Highly Reusable):**
    *   `useVirgilChat.ts`: This hook remains the brain of the *chat interaction* itself.
        *   It manages the array of messages (`{ role: 'user' | 'assistant', content: string }[]`).
        *   It takes user input (text/audio).
        *   It calls `AIService.ts` with the current message history and the *specific system prompt* for the current Virgil instance.
        *   It calls `ConversationManager.ts` to load the initial history (if any) and save updates (e.g., after each user/assistant message pair).
        *   **Key Change:** It needs to be initialized with the specific `systemPrompt`, the target `storageTable` identifier (passed to `ConversationManager`), and potentially a `conversationId` if resuming.

3.  **Core UI Component (Highly Reusable):**
    *   `VirgilChatUI.tsx` (New or Refactored `VirgilFullScreenChat`): Create a fundamental UI component that renders the chat interface.
        *   Displays messages (using shared message bubble components).
        *   Includes the input area (text input, microphone button for transcription).
        *   Takes the message array, loading state, sending function, etc., likely from `useVirgilChat`.
        *   It should be *layout-agnostic* – meaning it doesn't care if it's in a drawer or full-screen.

4.  **Layout Wrapper Components (Specific Layouts, Reusable Structure):**
    *   `VirgilFullScreenWrapper.tsx`: Renders `VirgilChatUI` within the full-screen layout (e.g., with the sidebar, potentially a header). It's responsible for fetching the correct `systemPrompt` (e.g., based on route/mode selection) and initializing `useVirgilChat` with the correct parameters (`systemPrompt`, `storageTable` identifier like 'general_chat' or 'course_chat', `conversationId`).
    *   `VirgilDrawerWrapper.tsx`: Renders `VirgilChatUI` within the drawer layout. Similar to the full-screen wrapper, it fetches the appropriate context (e.g., current book, DNA question) to determine the `systemPrompt` and initializes `useVirgilChat` with its specific parameters (`systemPrompt`, `storageTable` identifier like 'reader_chat' or 'dna_chat', `conversationId` linked to book/assessment).

5.  **Configuration Layer (Centralized Definition):**
    *   `virgilConfig.ts` (or similar): A central place (maybe a TS object/map) to define the different Virgil instances and their properties. This makes adding/modifying Virgils easier.
        ```typescript
        // Example virgilConfig.ts
        export const virgilInstances = {
          GENERAL_CHAT: {
            storageTable: 'general_chat_conversations', // Target table name
            fetchPrompt: async (modeId: string) => { /* Fetch from prompts table */ },
            uiLayout: 'fullscreen',
            // potentially other flags like requiresGrading: false
          },
          READER_CHAT: {
            storageTable: 'reader_conversations',
            fetchPrompt: async (bookId: string) => { /* Generate/fetch reader prompt */ return "You are assisting a user reading book X..."; },
            uiLayout: 'drawer',
          },
          COURSE_CHAT: {
            storageTable: 'course_conversations',
            fetchPrompt: async (courseId: string) => { /* Fetch course-specific prompt */ },
            uiLayout: 'fullscreen',
            trackProgress: true, // Example specific flag
          },
          EXAM_CHAT: {
            storageTable: 'exam_conversations', // Stores the conversation leading to the badge
            fetchPrompt: async (examId: string) => { /* Fetch exam prompt */ },
            uiLayout: 'fullscreen',
            requiresGrading: true, // Flag for post-conversation processing
          },
          // ... potentially DNA_CHAT etc.
        };
        ```
    *   The wrapper components would use this config to know which table to target, how to get the prompt, etc., based on the context (route, mode selected, book opened).

6.  **Data Storage (Supabase):**
    *   `prompts`: Stores reusable prompts, especially for the "General Chat" modalities. Include columns for `id`, `title`, `prompt_text`, `icon_name` (for the sidebar history), `category` (e.g., 'chat', 'course', 'exam').
    *   `general_chat_conversations`: Stores history for the various modalities in Virgil's Office. Columns: `id`, `user_id`, `created_at`, `updated_at`, `messages` (JSONB), `prompt_id` (FK to `prompts`), `last_message_preview` (text), `token_usage` (JSONB `{input: number, output: number}`).
    *   `reader_conversations`: Stores history for book chats. Columns: `id`, `user_id`, `created_at`, `updated_at`, `messages` (JSONB), `book_id` (text or FK), `last_message_preview` (text), `token_usage` (JSONB). *Crucially, this implies one ongoing conversation per book per user.*
    *   `course_conversations`: Stores history for course interactions. Columns: `id`, `user_id`, `created_at`, `updated_at`, `messages` (JSONB), `course_id` (text or FK), `progress_percentage` (number), `last_message_preview` (text), `token_usage` (JSONB).
    *   `exam_conversations` (or `badge_attempts`): Stores the conversation that constitutes an exam attempt. Columns: `id`, `user_id`, `created_at`, `updated_at`, `messages` (JSONB), `exam_id` (FK to `prompts` where category='exam'), `score` (number, null initially), `status` ('in_progress', 'completed', 'graded'), `token_usage` (JSONB).
    *   `badges`: Stores the earned badges. Columns: `id`, `user_id`, `exam_id` (FK), `earned_at`, `score`. (Generated after grading `exam_conversations`).

**Flow Example (Reader Chat):**

1.  User opens a book and clicks the Virgil chat icon.
2.  The e-reader component identifies the `book_id`.
3.  It renders `VirgilDrawerWrapper`, passing the `book_id` and the type 'READER_CHAT'.
4.  `VirgilDrawerWrapper` uses `virgilConfig` for 'READER_CHAT'.
5.  It fetches/generates the specific reader `systemPrompt` using the `book_id`.
6.  It initializes `useVirgilChat`, telling it to use the `reader_conversations` table (via `ConversationManager`), passing the `systemPrompt`, and querying `ConversationManager` for an existing conversation `id` for this `user_id` and `book_id`.
7.  `useVirgilChat` loads existing messages or starts fresh.
8.  `VirgilDrawerWrapper` renders the `VirgilChatUI` component, passing down state and functions from `useVirgilChat`.
9.  User interacts -> `useVirgilChat` handles state, calls `AIService` (with prompt + history), calls `ConversationManager` (to save updates to `reader_conversations` table, tagged with `book_id`).

This structure maximizes reusability of core logic (AI, state management, base UI) while allowing specific configurations (prompt, storage, layout, extra logic like grading/progress) for each distinct Virgil instance. Changes to the Gemini integration (`AIService`) or the core chat look/feel (`VirgilChatUI`) only need to happen in one place.

---

## Product Requirements Document (PRD): Virgil Chat System V2

**1. Introduction**

This document outlines the requirements for refactoring and expanding the Virgil chatbot system. The goal is to support multiple distinct Virgil chatbot instances across different parts of the application (e.g., general chat, e-reader, courses, exams) while maximizing code reusability, maintaining UI consistency where appropriate, and ensuring data separation for different conversation contexts. This PRD is intended for the engineering team, specifically targeting a junior developer for implementation.

**2. Goals**

*   **Reusability:** Implement a core chat engine (UI, AI interaction, state management) that is reused across all Virgil instances.
*   **Configurability:** Allow each Virgil instance to have its own distinct system prompt and dedicated conversation storage location (Supabase table).
*   **Maintainability:** Structure the code so that adding new Virgil instances or modifying existing ones is straightforward and localized, primarily through configuration changes.
*   **Data Isolation:** Ensure conversation history from different contexts (e.g., reading a specific book vs. taking a course) is stored and retrieved separately.
*   **UI Consistency:** Maintain a consistent core chat UI look and feel, while supporting two primary layouts: full-screen and drawer.
*   **Foundation:** Establish a robust foundation for future features like conversation summarization (compact), advanced analysis, and paywalls (via token tracking).

**3. Non-Goals**

*   Implementing the "compact" summarization feature (though the structure should facilitate it later).
*   Implementing the Stripe integration or paywall logic (only token *tracking* is required).
*   Building the DNA Assessment UI flow itself (focus is on the chat component *within* it, using the 'drawer' style).
*   Major UI redesign of the core chat elements (leverage existing styles/components).
*   Implementing the server-side logic for embedding search (this PRD focuses on the Virgil chat interactions).

**4. Virgil Instances Overview**

The following distinct Virgil instances need to be supported:

1.  **General Chat (Virgil's Office):**
    *   Accessed via "Chat with Virgil" in Virgil's Office.
    *   Presents multiple modalities (e.g., "Grow My Mind", "Read Closely", "Debug My Thinking").
    *   **UI:** Full-screen.
    *   **Prompt:** Fetched from `prompts` table based on selected modality.
    *   **Storage:** Shared table (`general_chat_conversations`), tagged with `prompt_id`.
    *   **History:** Sidebar shows *all* conversations from this table, identified by icons (from `prompts` table). Resuming a conversation uses the original modality's prompt.
2.  **Reader Chat:**
    *   Accessed from within the e-reader interface for a specific book.
    *   **UI:** Drawer.
    *   **Prompt:** Specific to assisting with the current book (potentially generic + book title/context).
    *   **Storage:** Dedicated table (`reader_conversations`), tagged with `book_id`.
    *   **History:** One continuous conversation per book. Re-opening chat for the same book resumes the *full* previous conversation history.
3.  **Course Chat:**
    *   Accessed within a specific course context.
    *   **UI:** Full-screen.
    *   **Prompt:** Specific to the course content/goals (fetched based on `course_id`).
    *   **Storage:** Dedicated table (`course_conversations`), tagged with `course_id`.
    *   **History:** Resuming chat within a course should potentially track/restore progress state (TBD precise mechanism, store `progress_percentage` for now). History view likely scoped to the course context.
4.  **Exam Chat (Test My Knowledge / Badges):**
    *   Accessed when starting an exam/badge attempt.
    *   **UI:** Full-screen.
    *   **Prompt:** Specific exam prompt (fetched based on `exam_id` from `prompts` table).
    *   **Storage:** Dedicated table (`exam_conversations`), tagged with `exam_id`.
    *   **History:** Each attempt is a *new* conversation. No resuming previous attempts. Conversation saved upon completion.
    *   **Post-Processing:** Requires a separate grading step after conversation completion to generate a score and potentially a badge.
5.  **Welcome Chat (Post-DNA / Kill Time):**
    *   Accessed potentially after DNA assessment or as an intro experience.
    *   **UI:** Full-screen (assumption, confirm if needed).
    *   **Prompt:** Specific welcome/introductory prompt.
    *   **Storage:** Can likely use `general_chat_conversations`, tagged with a specific 'welcome' `prompt_id`.
    *   **History:** Treat like any other general chat conversation.

**5. Functional Requirements**

**5.1. Core Architecture:**

*   **FR1.1:** Implement a central `AIService.ts` responsible *only* for communicating with the Gemini API (sending prompt+history, receiving response, potentially basic error handling).
*   **FR1.2:** Refactor `ConversationManager.ts` to handle CRUD operations for conversations in *multiple* specified Supabase tables. It should accept parameters indicating the target table and necessary identifiers (e.g., `book_id`, `course_id`, `prompt_id`).
*   **FR1.3:** Implement/Refactor `useVirgilChat.ts` hook to manage the core chat logic: message state, user input handling, calling `AIService`, and calling `ConversationManager`. It must be initializable with a `systemPrompt`, `storageTable` identifier, and optional `conversationId`.
*   **FR1.4:** Create/Refactor a core `VirgilChatUI.tsx` component responsible for rendering the chat interface (messages, input bar) based on props/state from `useVirgilChat`. This component should be layout-agnostic.
*   **FR1.5:** Implement layout-specific wrapper components (`VirgilFullScreenWrapper.tsx`, `VirgilDrawerWrapper.tsx`) that render `VirgilChatUI` and handle fetching the correct configuration (prompt, storage target) based on context (route, mode, book, etc.) and initializing `useVirgilChat`.
*   **FR1.6:** (Optional but Recommended) Create a central configuration file/object (`virgilConfig.ts`) mapping Virgil instance types to their configurations (storage table, prompt source/logic, UI layout, specific flags like `requiresGrading`).

**5.2. UI Requirements:**

*   **FR2.1:** The core chat interface (`VirgilChatUI`) must display user and assistant messages clearly, handle loading states, and provide a text input with a send button.
*   **FR2.2:** Include a microphone icon/button for initiating voice input (integration with transcription service is assumed to exist or be handled by `useVirgilChat`/`AIService`).
*   **FR2.3:** The `VirgilFullScreenWrapper` must render the chat UI taking up the main content area, potentially alongside the existing conversation history sidebar.
*   **FR2.4:** The `VirgilDrawerWrapper` must render the chat UI within a drawer component that overlays or sits alongside other content (like the e-reader text or DNA assessment questions). Styling should match the existing drawer implementations.

**5.3. Prompt Management:**

*   **FR3.1:** General Chat modalities must fetch their system prompts from the `prompts` Supabase table based on the selected modality ID.
*   **FR3.2:** Reader, Course, and Exam chats must use system prompts specific to their context (book, course, exam). Logic for fetching/generating these prompts will reside in the respective wrapper components or be defined in the config.
*   **FR3.3:** The user should not see the system prompt itself in the chat interface. The conversation should start with the user's first message or Virgil's first response after the system prompt.

**5.4. Conversation Management:**

*   **FR4.1:** Each Virgil instance type must store its conversation history in its designated Supabase table (see Section 7: Data Schema).
*   **FR4.2:** Conversation history (`messages` column) should be stored as a JSON array of objects, e.g., `{ role: 'user' | 'assistant', content: string }`.
*   **FR4.3:** Conversations should be saved/updated efficiently. **Decision:** Update the conversation row in Supabase after *each* user message is sent and after *each* assistant response is received. This ensures minimal data loss if the user closes the browser abruptly.
*   **FR4.4:** When initiating a chat for contexts allowing resumption (Reader, Course, General Chat), the system must query `ConversationManager` for an existing conversation based on relevant IDs (user_id + book_id/course_id/prompt_id/conversation_id).
*   **FR4.5:** If an existing conversation is found for resumable contexts, `useVirgilChat` must be initialized with the *full* message history from that conversation.
*   **FR4.6:** For non-resumable contexts (Exam Chat), a new conversation record must be created every time.
*   **FR4.7:** The conversation history sidebar component (`ConversationHistorySidebar`) needs to be adapted:
    *   When in Virgil's Office (General Chat context), it queries and displays conversations from `general_chat_conversations`, showing the icon associated with the `prompt_id` (fetched via a join or separate query to `prompts`).
    *   When in a Course context, it should ideally show history from `course_conversations` for that specific course.
    *   When in the Reader, it might not be displayed, or could potentially show previous chats for *other* books (TBD - simplify for now: sidebar primarily for Fullscreen modes).
    *   Clicking a conversation in the sidebar should load that conversation into the main chat view using its history and original system prompt.

**5.5. AI Integration:**

*   **FR5.1:** All interactions with the LLM must go through the central `AIService.ts`.
*   **FR5.2:** `useVirgilChat` must pass the correct `systemPrompt` and the current `messages` history to `AIService` for generating responses.

**5.6. Specific Instance Behaviors:**

*   **FR6.1 (Courses):** Store a `progress_percentage` field (or similar) in `course_conversations`. The logic for *calculating* this percentage is out of scope for this PRD, but the chat system should save/update it if provided.
*   **FR6.2 (Exams):**
    *   Do not allow resuming exam conversations.
    *   Mark the conversation status (e.g., 'completed') upon graceful exit/conclusion.
    *   Implement a *separate* function/process (triggered after completion) that takes the `exam_conversations.messages` history and the `exam_id`, calls the LLM with the grading rubric (from the `prompts` table or separate config), gets a score, and updates the `exam_conversations` record (`score`, `status`='graded'). This grading function is separate from the main chat flow.
    *   Upon successful grading, create an entry in the `badges` table.

**5.7. Token Tracking:**

*   **FR7.1:** `AIService` (or the component calling it) must capture the input and output token counts for each call to the Gemini API.
*   **FR7.2:** The total token usage (input + output) for a conversation should be stored/updated in the corresponding conversation table row (e.g., in a `token_usage` JSONB column like `{ "input": 1234, "output": 5678 }`). This should be updated with each message pair exchange.

**6. Technical Design Considerations**

*   Leverage the existing component library for UI elements (buttons, inputs, message bubbles).
*   Use TypeScript for better type safety, especially around configurations and service interfaces.
*   Consider error handling: What happens if the API call fails? If Supabase saving fails? Provide user feedback.
*   Implement loading indicators while waiting for AI responses or loading history.
*   Ensure Supabase Row Level Security (RLS) is properly configured so users can only access their own conversations.

**7. Data Schema (Proposed Supabase Tables)**

*   **`prompts`**
    *   `id`: uuid (Primary Key)
    *   `created_at`: timestampz
    *   `title`: text
    *   `prompt_text`: text (The system prompt)
    *   `icon_name`: text (e.g., Lucid React icon name)
    *   `category`: text ('general_chat', 'exam', 'course', 'welcome')
    *   `grading_rubric`: text (Optional, specifically for 'exam' category)
*   **`general_chat_conversations`**
    *   `id`: uuid (Primary Key)
    *   `user_id`: uuid (Foreign Key to `auth.users`)
    *   `created_at`: timestampz
    *   `updated_at`: timestampz
    *   `prompt_id`: uuid (Foreign Key to `prompts`)
    *   `messages`: jsonb (Array of `{role, content}`)
    *   `last_message_preview`: text
    *   `token_usage`: jsonb (`{input: number, output: number}`)
*   **`reader_conversations`**
    *   `id`: uuid (Primary Key)
    *   `user_id`: uuid (FK)
    *   `created_at`: timestampz
    *   `updated_at`: timestampz
    *   `book_id`: text (Or uuid if books have IDs) - *Ensure uniqueness constraint on (user_id, book_id)*
    *   `messages`: jsonb
    *   `last_message_preview`: text
    *   `token_usage`: jsonb
*   **`course_conversations`**
    *   `id`: uuid (Primary Key)
    *   `user_id`: uuid (FK)
    *   `created_at`: timestampz
    *   `updated_at`: timestampz
    *   `course_id`: text (Or uuid)
    *   `messages`: jsonb
    *   `progress_percentage`: integer (0-100, nullable)
    *   `last_message_preview`: text
    *   `token_usage`: jsonb
*   **`exam_conversations`**
    *   `id`: uuid (Primary Key)
    *   `user_id`: uuid (FK)
    *   `created_at`: timestampz
    *   `updated_at`: timestampz
    *   `exam_id`: uuid (FK to `prompts` where category='exam')
    *   `messages`: jsonb
    *   `status`: text ('in_progress', 'completed', 'grading', 'graded', 'error')
    *   `score`: integer (nullable)
    *   `token_usage`: jsonb
*   **`badges`**
    *   `id`: uuid (Primary Key)
    *   `user_id`: uuid (FK)
    *   `exam_id`: uuid (FK to `prompts`)
    *   `conversation_id`: uuid (FK to `exam_conversations`)
    *   `earned_at`: timestampz
    *   `score`: integer

*Note: Add appropriate indexes on `user_id`, `book_id`, `course_id`, `prompt_id`, `exam_id` for efficient querying.*

**8. Open Questions / Future Considerations**

*   How exactly is Course progress determined and passed to the chat system?
*   Specific UI/UX for handling API errors or long loading times.
*   How should the "Welcome" chat be triggered?
*   Refining the Reader chat prompt generation (is book title enough context?).
*   Mechanism for displaying earned badges (out of scope for chat implementation, but related).

**9. Acceptance Criteria**

*   **AC1:** User can initiate a "General Chat" from Virgil's office, select a modality (e.g., "Grow My Mind"), have a conversation, close it, and resume the *same* conversation later from the history sidebar, using the correct icon and prompt. History is saved in `general_chat_conversations`.
*   **AC2:** User can open a book, initiate the Virgil chat drawer, have a conversation, close it, reopen the *same* book later, and the *full* conversation history is restored. History is saved in `reader_conversations` linked to the `book_id`.
*   **AC3:** User can start a "Test My Knowledge" exam, have the conversation guided by the exam prompt, and upon completion, the conversation is saved in `exam_conversations`. Starting the same exam again creates a *new* conversation.
*   **AC4:** A separate (manually triggerable for testing) grading function exists that takes a completed `exam_conversations` record ID, processes it using the rubric, and updates the record with a score and 'graded' status, and creates a `badges` entry.
*   **AC5:** User can participate in a Course chat, and the conversation is saved in `course_conversations` linked to the `course_id`. Resuming works correctly.
*   **AC6:** All chat interactions correctly store/update token usage in the `token_usage` column of their respective conversation tables.
*   **AC7:** Code related to core AI calls (`AIService`), core chat state (`useVirgilChat`), and core UI rendering (`VirgilChatUI`) is demonstrably reused across the different Virgil instances.
*   **AC8:** Configuration for different Virgil types (storage table, prompt source) is centralized or clearly managed within wrapper components.
*   **AC9:** Both full-screen and drawer UI layouts are implemented and used in the correct contexts.
