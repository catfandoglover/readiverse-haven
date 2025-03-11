
# DNA Assessment AI Assistant Implementation

## Overview
We've implemented an AI assistant system to help users explore philosophical questions in the DNA assessment. The assistant (named Virgil) provides a conversational interface where users can discuss and reflect on the current question they're considering.

## Key Features Implemented

1. **Context-Aware Conversations**: 
   - The AI assistant is now aware of the current philosophical question being shown to the user
   - When a user changes to a new question, the system creates a fresh conversation with new context

2. **Dynamic Conversation Starters**:
   - Added a system that selects a random philosophical prompt from a curated list when starting a new conversation
   - Each new question gets a different conversation starter to keep the experience fresh
   - Prompts are designed to be open-ended and encourage thoughtful reflection

3. **Audio Response System**:
   - All AI assistant responses are automatically converted to speech using AWS Polly
   - Implemented auto-play functionality so audio responses begin playing immediately
   - Users can manually pause/play audio responses as needed

5. **User Experience Improvements**:
   - Clear visual indicators when the AI is processing responses
   - Support for both text and voice input from users
   - Mobile-friendly interface with floating AI chat button

## Technical Details

### Client-Side Components:
- `AIChatButton.tsx`: Floating button component for accessing the AI assistant
- `AIChatDialog.tsx`: Dialog component that contains the chat interface
- `ChatMessage.tsx`: Component for rendering individual messages with audio playback

### Services:
- `AIService.ts`: Client-side service for managing AI interactions
- `SpeechService.ts`: Handles speech synthesis and audio processing
- `ConversationManager.ts`: Maintains conversation context across interactions

## Current Status
The AI assistant now successfully provides contextual guidance for users exploring philosophical questions in the DNA assessment. It offers thoughtful prompts based on the specific question being considered and automatically plays audio responses to create a more engaging experience.

## Future Improvements
- Add voice style customization options
- Implement conversation history saving
- Add more sophisticated context management to track user's philosophical leanings



OTHER


I'll help you review the application to understand how it's storing DNA survey question history. Let's investigate the codebase using WCGW.

Now let's examine the codebase to understand how the application stores DNA survey question history. First, I'll look at the DNA-related pages and components to get a better understanding of the application structure.

I see there are two DNA-related pages: `DNAAssessment.tsx` and `IntellectualDNA.tsx`. Let's first examine the `DNAAssessment.tsx` file to understand how the survey works:

Now let's look at the `IntellectualDNA.tsx` file to understand how the results are displayed:



Let's check if there's a specific component for displaying the DNA results:



Let's check the Supabase functions that handle DNA analysis:



Now let's examine the database schema to understand the data model:



Let's check the Supabase types file to understand the database schema:





Let's check the `ConversationManager.ts` file to understand how it stores the question history:






Let's also check how the chat function works with the surveys:





Let's check what tables store DNA survey information by looking at the database schema and the Supabase policies:






Now, let's check the AIService.ts file to understand how it interacts with the survey data:





Let's examine the database tables structure for the DNA data:





Based on all the code and information we've examined, I can now summarize how the Readiverse Haven application stores and manages DNA survey question history:

# How Readiverse Haven Stores DNA Survey Question History

## Database Storage

### 1. Primary Storage Tables

The application uses several Supabase database tables to store DNA survey data:

1. **`dna_assessment_results`** - Stores the overall assessment data:
   - Contains the user's name
   - Records answer sequences for each category (ethics_sequence, epistemology_sequence, etc.)
   - Stores a JSON object of all answers in the `answers` field
   - Has a unique `id` for each assessment

2. **`dna_question_responses`** - Stores individual question responses:
   - Links to the assessment_id
   - Records the specific category (ETHICS, EPISTEMOLOGY, etc.)
   - Stores the question_id and the user's answer (A or B)
   - Timestamps when the answer was provided

3. **`dna_tree_structure`** - Manages the branching tree structure of questions:
   - Contains the tree_position (e.g., "Q1")
   - References the question_id from the `great_questions` table
   - Tracks next_question_a_id and next_question_b_id for branching
   - Organizes questions by category

4. **`dna_analysis_results`** - Stores the AI-generated analysis of user responses:
   - Links to the assessment_id
   - Contains detailed analysis text for each philosophical category
   - Includes kindred_spirit and challenging_voice data
   - Stores the raw response from the AI analysis

5. **`great_questions`** - Contains the actual question content:
   - Stores the question text
   - Contains answer options (answer_a, answer_b)
   - Categorizes questions by philosophical domain

### 2. Memory Storage

In addition to database storage, the application maintains in-memory question history using the `ConversationManager` service:

1. **`questionPaths`** - A Map that stores the sequence of questions and answers:
   ```typescript
   private questionPaths: Map<string, QuestionPath[]> = new Map();
   ```
   
   Each `QuestionPath` object includes:
   ```typescript
   interface QuestionPath {
     questionId: string;
     question: string;
     answer: string;
   }
   ```

2. **`conversations`** - A Map that stores the chat history with the AI assistant:
   ```typescript
   private conversations: Map<string, Message[]> = new Map();
   ```

   Each `Message` includes:
   ```typescript
   interface Message {
     role: 'user' | 'assistant';
     content: string;
     timestamp: Date;
     audioUrl?: string;
   }
   ```

3. **Session Storage** - The application uses the browser's sessionStorage to remember:
   - The user's name (`dna_assessment_name`)
   - Current assessment session information

## Flow of Data

1. **Assessment Initialization**:
   - A new record is created in `dna_assessment_results` with empty sequences
   - The user's name is stored both in the database and sessionStorage

2. **Question Navigation**:
   - As the user answers questions, the app navigates through the tree structure
   - Each answer (A or B) determines the next question based on next_question_a_id or next_question_b_id

3. **Answer Storage**:
   - Individual responses are stored in `dna_question_responses`
   - The answer sequence (e.g., "AABA") for each category is updated in `dna_assessment_results`
   - The full answers JSON is updated with all category sequences

4. **Conversation Tracking**:
   - The `ConversationManager` adds each question and answer to the questionPaths
   - This history is used to provide context for the AI assistant conversations
   - The history is keyed by the user's session ID (typically their name)

5. **AI Analysis**:
   - When the assessment is complete, the application calls the `analyze-dna` Supabase function
   - This function processes the answers and generates an analysis
   - Results are stored in the `dna_analysis_results` table

## Memory Management

- The ConversationManager implements an expiry mechanism that automatically cleans up messages older than 30 minutes
- Session-based storage ensures data is available for the duration of the user's session

## AI Integration

- The application uses the question history to provide context to the AI assistant through the `generateDynamicSystemPrompt` method
- This allows the AI to reference previous answers when helping users think through questions
- The conversation history is formatted with specific templates to guide the AI's response style

In summary, the application uses a combination of structured database storage and in-memory session management to track the user's DNA survey question history. This enables both analysis of philosophical tendencies and contextual AI conversations based on the user's previous answers.
