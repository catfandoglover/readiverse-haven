import React, { useState } from 'react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import ReaderSettingsMenu from './ReaderSettingsMenu';
import type { SearchResult } from '@/types/reader';
import { useIsMobile } from '@/hooks/use-mobile';

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
  showSettingsMenu: boolean;
  setShowSettingsMenu: (show: boolean) => void;
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
  onSearchResultClick,
  showSettingsMenu,
  setShowSettingsMenu
}) => {
  const isMobile = useIsMobile();

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
        className="fixed left-0 z-10 cursor-pointer"
        style={{ 
          width: isMobile ? "30%" : "max(0px, calc((100vw - 860px) / 2))",
          pointerEvents: "auto",
          top: "120px", 
          bottom: "60px"
        }}
        onClick={handlePrevTap}
      />
      
      {/* Right edge for next page */}
      <div 
        className="fixed right-0 z-10 cursor-pointer"
        style={{ 
          width: isMobile ? "30%" : "max(0px, calc((100vw - 860px) / 2))",
          pointerEvents: "auto",
          top: "120px",
          bottom: "60px"
        }}
        onClick={handleNextTap}
      />

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
