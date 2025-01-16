export interface Highlight {
  id: string;
  cfi: string;
  text: string;
  color: string;
  note?: string;
  createdAt: number;
  chapterInfo?: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';