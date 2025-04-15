


  Based on my analysis of the codebase, here's a detailed explanation of the Virgil
  architecture:

  Virgil System Architecture

  Core Components

  1. Memory Storage System
    - ConversationManager: Central service for storing and retrieving conversations
    - Supabase Tables: Five separate tables for different conversation types:
        - virgil_general_chat_conversations
      - virgil_reader_conversations
      - virgil_course_conversations
      - virgil_exam_conversations
      - virgil_dna_conversations
  2. Conversation View Renderer
    - VirgilChatUI.tsx: Basic UI component for chat display
    - VirgilFullScreenChat.tsx: Wrapper for full-screen variants
    - SharedVirgilDrawer: Used by DNA and reader implementations
  3. State Management
    - useVirgilChat Hook: Central state management for chat functionality
    - Manages recording, message history, API integration, and storage
  4. AIService
    - Interface to LLM (Gemini API)
    - Handles message formatting and API communication
    - Singleton pattern implementation
  5. VirgilConfig
    - Central configuration for all Virgil variants
    - Defines storage tables, UI layouts, context keys, and behavior

  Virgil Chat Variants

  1. General Virgil (GENERAL_CHAT)

  - Storage: virgil_general_chat_conversations
  - UI Layout: Full-screen
  - Context Key: prompt_id
  - Prompt Source: Direct from prompts table via prompt_id
  - Features:
    - Resumable conversations
    - General-purpose assistance

  2. Exam Room Virgil (EXAM_CHAT)

  - Storage: virgil_exam_conversations
  - UI Layout: Full-screen with exam context
  - Context Key: exam_id
  - Prompt Source: Prompts table via exam-specific ID
  - Unique Features:
    - Non-resumable conversations (new for each session)
    - Requires post-conversation grading
    - Exam-specific UI and theming (purple theme)
    - Exit confirmation dialog

  3. Classroom Virgil (COURSE_CHAT)

  - Storage: virgil_course_conversations
  - UI Layout: Full-screen with course context
  - Context Key: course_id
  - Prompt Source: Course-specific context
  - Unique Features:
    - Course progress tracking
    - Integration with course material
    - Green theme for UI
    - Automatic progress calculation

  4. DNA Assessment Virgil

  - Storage: virgil_dna_conversations
  - UI Layout: Dialog-based inside assessment
  - Context Key: Current question
  - Prompt Source: Default system prompt for assessment
  - Unique Features:
    - Integrated within DNA assessment flow
    - Separate implementation from main Virgil architecture
    - Uses SharedVirgilDrawer component
    - User ID from session storage rather than auth context

  Shared Resources

  1. Audio Features
    - Speech synthesis for assistant responses
    - Audio recording for user input
    - Transcription service
  2. Theme System
    - Different themes for each Virgil variant
    - Exam: Purple theme
    - Course: Green theme
    - General: Default theme
    - DNA: Light theme
  3. Prompt Management
    - Central prompts table in Supabase
    - Fetch utilities for different contexts
    - Default fallbacks

  Unique Elements by Variant

  1. General Virgil
    - Most basic implementation
    - Primarily focused on general Q&A
  2. Exam Virgil
    - Non-resumable conversations
    - Requires grading
    - Exam-specific UI and theme
  3. Classroom Virgil
    - Progress tracking
    - Course-specific prompts and context
    - Integration with learning materials
  4. DNA Assessment Virgil
    - Directly integrated in assessment flow
    - Question-specific context
    - Dialog-based UI vs. full screen

  This architecture demonstrates a well-structured system with clear separation of concerns
   while maintaining consistent patterns across different Virgil implementations.
