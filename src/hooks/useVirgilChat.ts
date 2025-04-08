
// Fix the tokenLimitReached property in the interface
interface AIResponse {
  text: string;
  audioUrl?: string;
  transcribedText?: string;
  tokenLimitReached?: boolean;
}
