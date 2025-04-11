export type VirgilInstanceType =
  | 'GENERAL_CHAT'
  | 'READER_CHAT'
  | 'COURSE_CHAT'
  | 'EXAM_CHAT'
  | 'WELCOME_CHAT';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
}; 
