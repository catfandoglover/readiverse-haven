export interface Highlight {
  id: string;
  cfiRange: string;
  color: HighlightColor;
  text: string;
  note?: string;
  createdAt: number;
  bookKey: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';