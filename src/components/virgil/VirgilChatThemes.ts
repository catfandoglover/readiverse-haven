
import { ChatVariant } from "@/types/chat";

export interface ThemeColors {
  background: string;
  inputBackground: string;
  text: string;
  userMessageBg: string;
  assistantMessageBg: string;
  inputText: string;
  inputPlaceholder: string;
  border: string;
}

export const chatThemes: Record<ChatVariant, ThemeColors> = {
  virgilchat: {
    background: 'bg-[#332E38]',
    inputBackground: 'bg-[#221F26]',
    text: 'text-[#E9E7E2]',
    userMessageBg: 'bg-[#4A4351]',
    assistantMessageBg: 'bg-[#221F26]',
    inputText: 'text-[#E9E7E2]',
    inputPlaceholder: 'placeholder:text-[#E9E7E2]/50',
    border: 'border-[#4A4351]'
  },
  virgildna: {
    background: 'bg-[#E7E4DB]',
    inputBackground: 'bg-[#E7E4DB]',
    text: 'text-[#282828]',
    userMessageBg: 'bg-[#332E38]/10',
    assistantMessageBg: 'bg-[#E7E4DB]',
    inputText: 'text-[#282828]',
    inputPlaceholder: 'placeholder:text-muted-foreground',
    border: 'border-[#D0CBBD]/25'
  },
  default: {
    background: 'bg-[#E7E4DB]',
    inputBackground: 'bg-[#E7E4DB]',
    text: 'text-[#282828]',
    userMessageBg: 'bg-[#332E38]/10',
    assistantMessageBg: 'bg-[#E7E4DB]',
    inputText: 'text-[#282828]',
    inputPlaceholder: 'placeholder:text-muted-foreground',
    border: 'border-[#D0CBBD]/25'
  }
};
