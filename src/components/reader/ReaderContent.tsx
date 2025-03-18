
import React, { useState, useCallback, useEffect } from 'react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import { useTheme } from '@/contexts/ThemeContext';
import BookViewer from './BookViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRenditionSetup } from '@/hooks/useRenditionSetup';
import { useReaderResize } from '@/hooks/useReaderResize';
import BrightnessOverlay from './BrightnessOverlay';
import { MinimalProgressBar } from './MinimalProgressBar';
import ReaderSidebar from './ReaderSidebar';
import FloatingActionButton from './FloatingActionButton';
import VirgilChatPanel from './VirgilChatPanel';
import { MessageCircle, Menu, BookOpen, Settings, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'notes' | 'bookmarks' | 'settings' | 'chat'>('toc');
  const [showUI, setShowUI] = useState(true);
  const [showVirgilChat, setShowVirgilChat] = useState(false);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const bookKey = book?.key() || null;

  // Hide UI after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      setShowUI(true);
      timeout = setTimeout(() => setShowUI(false), 3000);
    };
    
    resetTimer();
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openSidebarWithTab = (tab: 'toc' | 'notes' | 'bookmarks' | 'settings' | 'chat') => {
    setActiveTab(tab);
    setSidebarOpen(true);
  };

  const toggleVirgilChat = () => {
    setShowVirgilChat(!showVirgilChat);
  };

  // Extract book title and author using the correct property path
  const getBookTitle = (): string => {
    if (!book) return "Untitled Book";
    
    // Access the title through the package.metadata path if available
    if (book.package?.metadata?.title) {
      return book.package.metadata.title;
    }
    
    // Fallback to direct metadata property if available
    if ((book as any).metadata?.title) {
      return (book as any).metadata.title;
    }
    
    return "Untitled Book";
  };
  
  const getBookAuthor = (): string => {
    if (!book) return "Unknown Author";
    
    // Access the creator through the package.metadata path if available
    if (book.package?.metadata?.creator) {
      return book.package.metadata.creator;
    }
    
    // Fallback to direct metadata property if available
    if ((book as any).metadata?.creator) {
      return (book as any).metadata.creator;
    }
    
    return "Unknown Author";
  };

  return (
    <div className="relative h-full flex">
      {/* Sidebar Component */}
      <ReaderSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toc={toc}
        onTocNavigate={onTocNavigate}
        highlights={highlights}
        onHighlightSelect={onLocationChange}
        onRemoveHighlight={removeHighlight}
        currentLocation={currentLocation}
        onBookmarkClick={onBookmarkClick}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        textAlign={textAlign}
        onTextAlignChange={onTextAlignChange}
        brightness={brightness}
        onBrightnessChange={onBrightnessChange}
        bookKey={bookKey}
        sessionTime={sessionTime}
      />

      {/* Main Reading Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div 
          className="relative overflow-hidden h-screen"
          onClick={() => setShowUI(!showUI)}
        >
          {/* Book Viewer Component */}
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

          {/* Minimal Progress Bar */}
          <div className={`transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
            <MinimalProgressBar 
              progress={progress.book} 
              currentChapter={currentChapterTitle} 
              pageInfo={pageInfo} 
            />

            {/* Navigation Controls */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
              <button
                onClick={onPrevPage}
                disabled={pageInfo.current <= 1}
                className={`flex items-center justify-center w-6 h-6 rounded-full
                ${pageInfo.current > 1 ? 'bg-background/50 hover:bg-background/70' : 'bg-background/20'}
                text-foreground transition-colors shadow-md`}
                aria-label="Previous"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              
              <button
                onClick={onNextPage}
                disabled={pageInfo.current >= pageInfo.total}
                className={`flex items-center justify-center w-6 h-6 rounded-full
                ${pageInfo.current < pageInfo.total ? 'bg-background/50 hover:bg-background/70' : 'bg-background/20'}
                text-foreground transition-colors shadow-md`}
                aria-label="Next"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-20">
              <FloatingActionButton 
                icon={Menu} 
                onClick={toggleSidebar} 
                tooltip="Table of Contents"
              />
              <FloatingActionButton 
                icon={BookOpen} 
                onClick={() => openSidebarWithTab('bookmarks')} 
                tooltip="Bookmarks"
              />
              <FloatingActionButton 
                icon={Settings} 
                onClick={() => openSidebarWithTab('settings')} 
                tooltip="Settings"
              />
              <FloatingActionButton 
                icon={MessageCircle} 
                onClick={toggleVirgilChat} 
                tooltip="Chat with Virgil"
              />
            </div>
          </div>

          {/* Chat with Virgil Panel - Conditionally Rendered */}
          {showVirgilChat && (
            <VirgilChatPanel 
              onClose={toggleVirgilChat} 
              bookContext={{
                title: getBookTitle(),
                author: getBookAuthor(),
                currentChapter: currentChapterTitle
              }}
            />
          )}

          {/* Brightness Overlay */}
          <BrightnessOverlay brightness={brightness} />
        </div>
      </div>
    </div>
  );
};

export default ReaderContent;
