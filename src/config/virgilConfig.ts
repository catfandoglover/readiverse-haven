import { VirgilInstanceType } from '../types/virgil';

// Define the configuration structure for each instance based on PRD V2
export type VirgilConfig = {
  storageTable: string; // Name of the Supabase table
  uiLayout: 'fullscreen' | 'drawer';
  contextKey: string; // Primary key for context identification (e.g., 'prompt_id', 'book_id', 'course_id', 'exam_id')
  promptSource: 'prompt_id' | 'book_context' | 'course_context'; // How the prompt is determined based on the contextKey
  isResumable: boolean; // Can the conversation be resumed?
  requiresGrading?: boolean; // Does this type need post-conversation grading?
};

/**
 * Central configuration for different Virgil chat instances.
 * Maps each VirgilInstanceType to its specific settings, driving UI layout,
 * data storage, prompt retrieval, and behavior.
 */
export const virgilConfig: Record<VirgilInstanceType, VirgilConfig> = {
  GENERAL_CHAT: {
    storageTable: 'virgil_general_chat_conversations',
    uiLayout: 'fullscreen',
    contextKey: 'prompt_id', // This ID comes from the selected modality/prompt in the 'prompts' table
    promptSource: 'prompt_id', // Assumes contextKey value is the prompt_id from 'prompts' table
    isResumable: true,
  },
  READER_CHAT: {
    storageTable: 'virgil_reader_conversations',
    uiLayout: 'drawer',
    contextKey: 'book_id', // The unique identifier for the book
    promptSource: 'book_context', // Prompt needs to be constructed based on book context (e.g., book title)
    isResumable: true,
  },
  COURSE_CHAT: {
    storageTable: 'virgil_course_conversations',
    uiLayout: 'fullscreen',
    contextKey: 'course_id', // The unique identifier for the course
    promptSource: 'course_context', // Prompt needs to be constructed/fetched based on course context
    isResumable: true,
  },
  EXAM_CHAT: {
    storageTable: 'virgil_exam_conversations',
    uiLayout: 'fullscreen',
    contextKey: 'exam_id', // This ID is used for tagging and maps to a prompt_id in 'prompts' table
    promptSource: 'prompt_id', // Assumes contextKey value is the prompt_id for the exam prompt
    isResumable: false,
    requiresGrading: true,
  },
  WELCOME_CHAT: {
    storageTable: 'virgil_general_chat_conversations', // Uses the general chat table
    uiLayout: 'fullscreen',
    contextKey: 'prompt_id', // A specific 'welcome' prompt_id (from 'prompts' table) needs to be passed in context
    promptSource: 'prompt_id', // Assumes contextKey value is the specific 'welcome' prompt_id
    isResumable: true, // Treated like general chat for resumption
  },
  // DNA_ASSESSMENT_CHAT is removed as it's not part of the core PRD V2 scope
  // defined in src/types/virgil.ts VirgilInstanceType
};

// Helper function to get config (optional)
export const getVirgilConfig = (instanceType: VirgilInstanceType): VirgilConfig => {
  const config = virgilConfig[instanceType];
  if (!config) {
    throw new Error(`Configuration for Virgil instance type "${instanceType}" not found.`);
  }
  return config;
}; 
