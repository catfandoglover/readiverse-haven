
export type ChatVariant = 'virgilchat' | 'virgildna' | 'default';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  isNew?: boolean;
  transcribedText?: string;
}
