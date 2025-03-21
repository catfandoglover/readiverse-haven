
import React from 'react';
import BookViewer from './BookViewer';
import NavigationButtons from './NavigationButtons';
import FloatingControls from './FloatingControls';
import { MessageSquare, Search } from 'lucide-react';
import FloatingActionButton from './FloatingActionButton';
import type { Highlight } from '@/types/highlight';

interface ReaderContentProps {
  book: any;
  fontSize: number;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  textAlign?: 'left' | 'justify' | 'center';
  brightness: number;
  currentLocation: string | null;
  progress: number;
  pageInfo: any;
  sessionTime: number;
  highlights: Highlight[];
  selectedColor: 'yellow';
  toc: any[];
  currentChapterTitle: string;
  showBookmarkDialog: boolean;
  onFontSizeChange: (fontSize: number) => void;
  onFontFamilyChange: (fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  onTextAlignChange: (textAlign: 'left' | 'justify' | 'center') => void;
  onBrightnessChange: (brightness: number) => void;
  onBookmarkClick: () => void;
  onLocationChange: (location: any) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTocNavigate: (href: string) => void;
  onRenditionReady: (rendition: any) => void;
  onTextSelect: (cfiRange: string, text: string) => void;
  setShowBookmarkDialog: (show: boolean) => void;
  handleRemoveBookmark: () => void;
  setSelectedColor: (color: 'yellow') => void;
  removeHighlight: (highlightId: string) => void;
  onSearch: (query: string) => Promise<any[]>;
  onSearchResultClick: (result: any) => void;
}

const ReaderContent = ({
  book,
  fontSize,
  fontFamily,
  textAlign,
  brightness,
  currentLocation,
  progress,
  pageInfo,
  sessionTime,
  highlights,
  selectedColor,
  toc,
  currentChapterTitle,
  showBookmarkDialog,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onBrightnessChange,
  onBookmarkClick,
  onLocationChange,
  onPrevPage,
  onNextPage,
  onTocNavigate,
  onRenditionReady,
  onTextSelect,
  setShowBookmarkDialog,
  handleRemoveBookmark,
  setSelectedColor,
  removeHighlight,
  onSearch,
  onSearchResultClick
}: ReaderContentProps) => {

  return (
    <div className="relative">
      <BookViewer
        book={book}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textAlign={textAlign}
        onRenditionReady={onRenditionReady}
        highlights={highlights}
        onTextSelect={onTextSelect}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
      
      <NavigationButtons 
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onSearch={onSearch}
        onSearchResultClick={onSearchResultClick}
      />
      
      <FloatingControls
        currentLocation={currentLocation}
        onLocationSelect={onTocNavigate}
        onBookmarkClick={onBookmarkClick}
        highlights={highlights}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onHighlightSelect={cfiRange => onTocNavigate(cfiRange)}
        onRemoveHighlight={removeHighlight}
        bookKey={book?.key() || null}
      />
      
      {/* Virgil chat button in the top right without hover state */}
      <div className="fixed top-4 right-4 z-50">
        <FloatingActionButton
          icon={MessageSquare}
          onClick={() => window.dispatchEvent(new CustomEvent('openVirgilChat'))}
          tooltip="Chat with Virgil"
          noHoverEffect={true}
        />
      </div>
    </div>
  );
};

export default ReaderContent;
