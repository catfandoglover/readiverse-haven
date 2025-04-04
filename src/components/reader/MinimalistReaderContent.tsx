
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import { useTheme } from '@/contexts/ThemeContext';
import BookViewer from './BookViewer';
import MinimalistTopBar from './MinimalistTopBar';
import PageIndicator from './PageIndicator';
import VirgilChatButton from './VirgilChatButton';
import ReaderEdgeControls from './ReaderEdgeControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVirgilReader } from '@/contexts/VirgilReaderContext';
import VirgilDrawer from './VirgilDrawer';
import type { SearchResult, BookMetadata } from '@/types/reader';
import BookmarkDialog from './BookmarkDialog';
import BrightnessOverlay from './BrightnessOverlay';
import type { Rendition } from 'epubjs';

interface MinimalistReaderContentProps {
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
  showBookmarkDialog: boolean;
  externalLink: string | null;
  metadata: BookMetadata | null;
  onFontSizeChange: (value: number[]) => void;
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  onBrightnessChange: (value: number[]) => void;
  onBookmarkClick: () => void;
  onLocationChange: (location: any) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTocNavigate: (href: string) => void;
  onRenditionReady: (rendition: Rendition) => void;
  onTextSelect: (cfiRange: string, text: string) => void;
  setShowBookmarkDialog: (show: boolean) => void;
  handleRemoveBookmark: () => void;
  setSelectedColor: (color: 'yellow') => void;
  removeHighlight: (id: string) => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSearchResultClick: (result: SearchResult) => void;
}

const MinimalistReaderContent: React.FC<MinimalistReaderContentProps> = ({
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
  externalLink,
  metadata,
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
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const bookKey = book?.key() || null;
  const [showControls, setShowControls] = useState(false);
  const showControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const { showVirgilChat } = useVirgilReader();

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (showControlsTimer.current) {
      clearTimeout(showControlsTimer.current);
    }

    showControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (showControlsTimer.current) {
        clearTimeout(showControlsTimer.current);
      }
    };
  }, [handleMouseMove]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const x = e.touches[0].clientX;
    const width = window.innerWidth;
    
    // Don't handle edge touches as they are used for page navigation
    if (x < width * 0.15 || x > width * 0.85) return;
    
    setShowControls(true);
    
    if (showControlsTimer.current) {
      clearTimeout(showControlsTimer.current);
    }

    showControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleTouchStart]);

  return (
    <div 
      className="flex flex-col h-full w-full relative bg-[#332E38]"
      style={{
        height: showVirgilChat ? 'calc(60vh)' : '100vh',
        transition: 'height 0.3s ease-in-out'
      }}
    >
      <MinimalistTopBar 
        title={metadata?.title || currentChapterTitle} 
        externalLink={externalLink}
        showControls={showControls}
      />

      <div className="flex-grow relative">
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
        
        <ReaderEdgeControls
          show={showControls}
          book={book}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textAlign={textAlign}
          brightness={brightness}
          currentLocation={currentLocation}
          progress={progress}
          pageInfo={pageInfo}
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
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onTocNavigate={onTocNavigate}
          setSelectedColor={setSelectedColor}
          removeHighlight={removeHighlight}
          bookKey={bookKey}
          onSearch={onSearch}
          onSearchResultClick={onSearchResultClick}
        />
      </div>

      <PageIndicator 
        currentPage={pageInfo.chapterCurrent} 
        totalPages={pageInfo.chapterTotal} 
        show={showControls} 
      />

      <VirgilChatButton />
      
      <VirgilDrawer bookTitle={metadata?.title || currentChapterTitle} />

      <BookmarkDialog
        open={showBookmarkDialog}
        onOpenChange={setShowBookmarkDialog}
        onRemoveBookmark={handleRemoveBookmark}
        chapterTitle={currentChapterTitle}
      />

      <BrightnessOverlay brightness={brightness} />
    </div>
  );
};

export default MinimalistReaderContent;
