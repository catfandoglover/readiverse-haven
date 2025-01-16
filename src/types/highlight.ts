export interface Highlight {
  id: string;
  cfiRange: string;
  color: 'yellow';
  text: string;
  note?: string;
  createdAt: number;
  bookKey: string;
}

export type HighlightColor = 'yellow';