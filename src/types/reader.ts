export interface BookMetadata {
  coverUrl?: string;
  title?: string;
  author?: string;
}

export interface ReaderProps {
  metadata?: BookMetadata;
}