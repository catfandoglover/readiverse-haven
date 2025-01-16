export type HighlightColor = 'yellow';

export interface Highlight {
  id: string;
  cfiRange: string;
  color: HighlightColor;
  text: string;
  note?: string;
  createdAt: number;
  bookKey: string;
}