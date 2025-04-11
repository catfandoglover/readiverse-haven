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
import { Progress } from '@/components/ui/progress';

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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const showControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const { showVirgilChat, shouldMoveContent } = useVirgilReader();

  // Check if current location is bookmarked
  useEffect(() => {
    if (!currentLocation || !bookKey) return;
    
    const checkIfBookmarked = () => {
      const bookmarkKey = `book-progress-${currentLocation}`;
      const bookmarkData = localStorage.getItem(bookmarkKey);
      if (bookmarkData) {
        try {
          const data = JSON.parse(bookmarkData);
          setIsBookmarked(data.bookKey === bookKey);
        } catch {
          setIsBookmarked(false);
        }
      } else {
        setIsBookmarked(false);
      }
    };
    
    checkIfBookmarked();
    
    // Listen for storage events (works better on desktop)
    const handleStorage = () => {
      checkIfBookmarked();
    };
    
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentLocation, bookKey]);

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
    <div className="flex flex-col h-screen relative">
      <div 
        className={`flex flex-col transition-all duration-300 ${
          showVirgilChat ? 'h-[calc(50vh-env(safe-area-inset-bottom))]' : 'h-[calc(100vh-64px)]'
        }`}
      >
        <MinimalistTopBar 
          title={metadata?.title || currentChapterTitle} 
          externalLink={externalLink}
          showControls={showControls}
          onMenuClick={() => setShowSettingsMenu(true)}
          isBookmarked={isBookmarked}
          onBookmarkClick={onBookmarkClick}
        />

        {/* Progress Bar - Only visible in hover state */}
        <div className={`w-full px-4 md:px-6 lg:px-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Progress 
            value={progress.book} 
            className="h-1" 
          />
        </div>

        <div className="flex-grow relative overflow-hidden">
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
            showSettingsMenu={showSettingsMenu}
            setShowSettingsMenu={setShowSettingsMenu}
          />
        </div>
      </div>

      {!showVirgilChat && (
        <div className="h-16">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <VirgilChatButton />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none">
            <PageIndicator 
              currentPage={pageInfo.chapterCurrent} 
              totalPages={pageInfo.chapterTotal} 
              show={showControls} 
            />
          </div>
        </div>
      )}
      
      <div 
        className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${
          showVirgilChat 
            ? 'h-[calc(50vh+env(safe-area-inset-bottom))] translate-y-0' 
            : 'h-[calc(50vh+env(safe-area-inset-bottom))] translate-y-full'
        }`}
      >
        <VirgilDrawer bookTitle={currentChapterTitle} />
      </div>

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
