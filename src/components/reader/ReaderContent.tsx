import React, { useState, useCallback, useEffect } from 'react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import { useTheme } from '@/contexts/ThemeContext';
import TableOfContents from './TableOfContents';
import NavigationButtons from './NavigationButtons';
import BookViewer from './BookViewer';
import ViewerContainer from './ViewerContainer';
import BrightnessOverlay from './BrightnessOverlay';
import { DesktopControls } from './controls/DesktopControls';
import { MobileControls } from './controls/MobileControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRenditionSetup } from '@/hooks/useRenditionSetup';
import { useReaderResize } from '@/hooks/useReaderResize';
import { useSafariViewportFix } from '@/hooks/useSafariViewportFix';
import ReaderControls from './ReaderControls';
import ProgressTracker from './ProgressTracker';
import FloatingControls from './FloatingControls';
import BookmarkDialog from './BookmarkDialog';

interface ReaderContentProps {
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
  onFontSizeChange: (value: number[]) => void;
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
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
  const [container, setContainer] = useState<Element | null>(null);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isSafariMobile = useSafariViewportFix();
  const bookKey = book?.key() || null;

  const {
    rendition,
    setRendition,
    setupRendition,
  } = useRenditionSetup(
    book!,
    isMobile,
    textAlign,
    fontFamily,
    theme,
    currentLocation,
    onLocationChange,
    onTextSelect,
    highlights
  );

  const {
    resizeObserver,
    setResizeObserver,
    debouncedContainerResize
  } = useReaderResize(rendition);

  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isMobile || !rendition) return;

    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const width = window.innerWidth;
    const threshold = width * 0.05; // 5% of screen width for tap areas

    if (x < threshold) {
      e.preventDefault();
      onPrevPage();
    } else if (x > width - threshold) {
      e.preventDefault();
      onNextPage();
    }
  }, [isMobile, rendition, onPrevPage, onNextPage]);

  React.useEffect(() => {
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('click', handleTouchStart);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('click', handleTouchStart);
    };
  }, [isMobile, handleTouchStart]);

  // Effect to initialize any iOS Safari specific handling
  useEffect(() => {
    if (!isMobile || !isSafariMobile) return;
    
    // Handle Safari-specific viewport issues
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      // Store original content to restore later
      const originalContent = metaViewport.getAttribute('content') || '';
      
      // Set viewport to prevent scaling/zooming during reading
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no');
      
      // Restore original viewport on cleanup
      return () => {
        metaViewport.setAttribute('content', originalContent);
      };
    }
  }, [isMobile, isSafariMobile]);

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
        bookKey={bookKey}
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
        <div className="relative">
          {isMobile && (
            <>
              <div 
                className="absolute left-0 top-0 w-[5%] h-full z-10"
                onClick={onPrevPage}
              />
              <div 
                className="absolute right-0 top-0 w-[5%] h-full z-10"
                onClick={onNextPage}
              />
            </>
          )}
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
        bookKey={bookKey}
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
