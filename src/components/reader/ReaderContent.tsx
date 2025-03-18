
import React, { useState, useEffect } from 'react';
import type { Book } from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import { useTheme } from '@/contexts/ThemeContext';
import BookViewer from './BookViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import BrightnessOverlay from './BrightnessOverlay';
import { MinimalProgressBar } from './MinimalProgressBar';
import ReaderSidebar from './ReaderSidebar';
import FloatingActionButton from './FloatingActionButton';
import VirgilChatPanel from './VirgilChatPanel';
import { BookOpen } from 'lucide-react';

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
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const bookKey = book?.key() || null;

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

  const getBookTitle = (): string => {
    if (!book) return "Untitled Book";
    
    const metadata = (book as any).metadata || (book as any).package?.metadata || {};
    
    return metadata.title || "Untitled Book";
  };
  
  const getBookAuthor = (): string => {
    if (!book) return "Unknown Author";
    
    const metadata = (book as any).metadata || (book as any).package?.metadata || {};
    
    return metadata.creator || metadata.author || "Unknown Author";
  };

  return (
    <div className="relative h-full flex overflow-hidden">
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

      <div className={`flex-1 transition-all duration-300 ease-in-out max-w-full ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div 
          className="relative overflow-hidden h-screen"
          onClick={() => setShowUI(!showUI)}
        >
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

          <div className={`transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
            <MinimalProgressBar 
              progress={progress.book} 
              currentChapter={currentChapterTitle} 
              pageInfo={pageInfo} 
            />

            <div 
              className="fixed bottom-6 left-6 flex flex-col gap-2 z-20"
              onMouseEnter={() => setShowFloatingButtons(true)}
              onMouseLeave={() => setShowFloatingButtons(false)}
            >
              <div className={`transition-all duration-300 ${showFloatingButtons ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <FloatingActionButton 
                  icon={BookOpen} 
                  onClick={toggleSidebar} 
                  tooltip="Table of Contents"
                />
              </div>
              <div className={`transition-all duration-300 ${showFloatingButtons ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <FloatingActionButton 
                  iconImage="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil%20Chat.png" 
                  onClick={toggleVirgilChat} 
                  tooltip="Chat with Virgil"
                />
              </div>
            </div>
          </div>

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

          <BrightnessOverlay brightness={brightness} />
        </div>
      </div>
    </div>
  );
};

export default ReaderContent;
