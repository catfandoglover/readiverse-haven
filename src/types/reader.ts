import type { Highlight, HighlightColor } from './highlight';
import type { NavItem } from 'epubjs';

export interface BookMetadata {
  coverUrl?: string;
  title?: string;
  author?: string;
}

export interface ReaderProps {
  metadata: BookMetadata;
  preloadedBookUrl?: string | null;
  isLoading?: boolean;
  error?: Error;
}

export interface SearchResult {
  href: string;
  excerpt: string;
  chapterTitle?: string;
  spineIndex?: number;
}

export interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationChange?: (location: string) => void;
  sessionTime: number;
  highlights?: Highlight[];
  selectedHighlightColor?: HighlightColor;
  onHighlightColorSelect?: (color: HighlightColor) => void;
  onHighlightSelect?: (cfiRange: string) => void;
  onRemoveHighlight?: (id: string) => void;
  toc?: NavItem[];
  onNavigate?: (href: string) => void;
  bookKey: string | null;
}