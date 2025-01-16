export interface Highlight {
  id: string;
  cfiRange: string;
  color: string;
  text: string;
  note?: string;
  createdAt: number;
  bookKey: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';