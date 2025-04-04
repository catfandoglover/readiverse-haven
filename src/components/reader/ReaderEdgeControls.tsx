
import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import { Button } from '@/components/ui/button';
import ReaderSettingsMenu from './ReaderSettingsMenu';
import ProgressBar from './ProgressBar';
import type { SearchResult } from '@/types/reader';

interface ReaderEdgeControlsProps {
  show: boolean;
  book: Book;
  fontSize: number;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  textAlign: 'left' | 'justify' | 'center';
  brightness: number;
  currentLocation: string | null;
  progress: { book: number };
  pageInfo: {
    current: number;
    total: number;
    chapterCurrent: number;
    chapterTotal: number;
  };
  sessionTime: number;
  highlights: Highlight[];
  selectedColor: 'yellow';
  toc: NavItem[];
  currentChapterTitle: string;
  onFontSizeChange: (value: number[]) => void;
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  onBrightnessChange: (value: number[]) => void;
  onBookmarkClick: () => void;
  onLocationChange: (location: any) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTocNavigate: (href: string) => void;
  setSelectedColor: (color: 'yellow') => void;
  removeHighlight: (id: string) => void;
  bookKey: string | null;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSearchResultClick: (result: SearchResult) => void;
}

const ReaderEdgeControls: React.FC<ReaderEdgeControlsProps> = ({
  show,
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
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onBrightnessChange,
  onBookmarkClick,
  onLocationChange,
  onPrevPage,
  onNextPage,
  onTocNavigate,
  setSelectedColor,
  removeHighlight,
  bookKey,
  onSearch,
  onSearchResultClick
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Edge navigation touch areas
  const handlePrevTap = (e: React.MouseEvent) => {
    e.preventDefault();
    onPrevPage();
  };

  const handleNextTap = (e: React.MouseEvent) => {
    e.preventDefault();
    onNextPage();
  };

  return (
    <>
      {/* Left edge for previous page */}
      <div 
        className="absolute left-0 top-0 w-[15%] h-full z-10 cursor-w-resize"
        onClick={handlePrevTap}
      />
      
      {/* Right edge for next page */}
      <div 
        className="absolute right-0 top-0 w-[15%] h-full z-10 cursor-e-resize"
        onClick={handleNextTap}
      />

      {/* Progress bar */}
      <div 
        className={`absolute bottom-12 left-0 w-full px-4 transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ProgressBar progress={progress.book} />
      </div>

      {/* Menu button */}
      <div 
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettingsMenu(true)}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <ReaderSettingsMenu 
        open={showSettingsMenu}
        onOpenChange={setShowSettingsMenu}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textAlign={textAlign}
        brightness={brightness}
        currentLocation={currentLocation}
        sessionTime={sessionTime}
        highlights={highlights}
        selectedColor={selectedColor}
        toc={toc}
        currentChapterTitle={currentChapterTitle}
        onFontSizeChange={onFontSizeChange}
        onFontFamilyChange={onFontFamilyChange}
        onTextAlignChange={onTextAlignChange}
        onBrightnessChange={onBrightnessChange}
        onBookmarkClick={onBookmarkClick}
        onLocationChange={onLocationChange}
        setSelectedColor={setSelectedColor}
        removeHighlight={removeHighlight}
        bookKey={bookKey}
        onTocNavigate={(href) => {
          onTocNavigate(href);
          setShowSettingsMenu(false);
        }}
        onSearch={onSearch}
        onSearchResultClick={(result) => {
          onSearchResultClick(result);
          setShowSettingsMenu(false);
        }}
      />
    </>
  );
};

export default ReaderEdgeControls;
