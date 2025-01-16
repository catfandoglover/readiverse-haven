export interface BookMetadata {
  coverUrl?: string;
  title?: string;
  author?: string;
}

export interface ReaderProps {
  metadata?: BookMetadata;
}

export interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'georgia' | 'helvetica' | 'times') => void;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationChange?: (location: string) => void;
  sessionTime: number;
  // Add highlight-related props
  highlights: Array<{
    id: string;
    cfiRange: string;
    color: 'yellow';
    text: string;
    note?: string;
    createdAt: number;
    bookKey: string;
  }>;
  selectedColor: 'yellow';
  onColorSelect: (color: 'yellow') => void;
  onHighlightSelect: (cfiRange: string) => void;
  onRemoveHighlight: (id: string) => void;
}