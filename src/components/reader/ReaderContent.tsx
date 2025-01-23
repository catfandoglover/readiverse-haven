import React from 'react';
import ReaderControls from "./ReaderControls";
import ProgressTracker from "./ProgressTracker";
import NavigationButtons from "./NavigationButtons";
import TableOfContents from "./TableOfContents";
import BookViewer from "./BookViewer";
import FloatingControls from "./FloatingControls";
import BookmarkDialog from "./BookmarkDialog";
import BrightnessOverlay from "./BrightnessOverlay";
import type { Book } from "epubjs";
import type { NavItem } from 'epubjs';
import type { Highlight } from '@/types/highlight';

interface ReaderContentProps {
  book: Book;
  fontSize: number;
  fontFamily: 'georgia' | 'helvetica' | 'times';
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
  showBookmarkDialog: boolean;
  onFontSizeChange: (value: number[]) => void;
  onFontFamilyChange: (value: 'georgia' | 'helvetica' | 'times') => void;
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  onBrightnessChange: (value: number[]) => void;
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
  removeHighlight: (id: string) => void;
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
}: ReaderContentProps) => {
  return (
    <>
      <ReaderControls
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        textAlign={textAlign}
        onTextAlignChange={onTextAlignChange}
        brightness={brightness}
        onBrightnessChange={onBrightnessChange}
        currentLocation={currentLocation}
        onBookmarkClick={onBookmarkClick}
        onLocationChange={onLocationChange}
        sessionTime={sessionTime}
        highlights={highlights}
        selectedHighlightColor={selectedColor}
        onHighlightColorSelect={setSelectedColor}
        onHighlightSelect={onLocationChange}
        onRemoveHighlight={removeHighlight}
        toc={toc}
        onNavigate={onTocNavigate}
      />
      
      <ProgressTracker 
        bookProgress={progress.book}
        pageInfo={pageInfo}
      />

      <div className="relative">
        <NavigationButtons
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
        />
        <div className="fixed md:absolute left-1/2 -translate-x-1/2 top-4 z-50 hidden md:block">
          <TableOfContents toc={toc} onNavigate={onTocNavigate} />
        </div>
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
        />
      </div>

      <FloatingControls
        currentLocation={currentLocation}
        onLocationSelect={onLocationChange}
        onBookmarkClick={onBookmarkClick}
        highlights={highlights}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onHighlightSelect={onLocationChange}
        onRemoveHighlight={removeHighlight}
      />

      <BookmarkDialog
        open={showBookmarkDialog}
        onOpenChange={setShowBookmarkDialog}
        onRemoveBookmark={handleRemoveBookmark}
        chapterTitle={currentChapterTitle}
      />

      <BrightnessOverlay brightness={brightness} />
    </>
  );
};

export default ReaderContent;