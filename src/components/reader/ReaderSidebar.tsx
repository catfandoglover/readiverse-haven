
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Bookmark, MessageCircle, Settings, X } from 'lucide-react';
import type { NavItem } from 'epubjs';
import type { Highlight } from '@/types/highlight';
import FontControls from './controls/FontControls';
import AlignmentControls from './controls/AlignmentControls';
import BrightnessControl from './controls/BrightnessControl';
import SessionTimer from './SessionTimer';
import BookmarksMenu from './BookmarksMenu';
import HighlightsMenu from './HighlightsMenu';

interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'toc' | 'notes' | 'bookmarks' | 'settings' | 'chat';
  setActiveTab: (tab: 'toc' | 'notes' | 'bookmarks' | 'settings' | 'chat') => void;
  toc: NavItem[];
  onTocNavigate: (href: string) => void;
  highlights: Highlight[];
  onHighlightSelect: (cfiRange: string) => void;
  onRemoveHighlight: (id: string) => void;
  currentLocation: string | null;
  onBookmarkClick: () => void;
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
  bookKey: string | null;
  sessionTime: number;
}

const ReaderSidebar: React.FC<ReaderSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  toc,
  onTocNavigate,
  highlights,
  onHighlightSelect,
  onRemoveHighlight,
  currentLocation,
  onBookmarkClick,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  brightness,
  onBrightnessChange,
  bookKey,
  sessionTime
}) => {
  return (
    <div className={`fixed top-0 left-0 z-30 w-80 h-screen bg-background/95 backdrop-blur-xl border-r border-border/10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex justify-between items-center p-4 border-b border-border/10">
        <h2 className="font-serif text-lg">Reader Menu</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="toc">
            <Book className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="notes">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen-line"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </TabsTrigger>
          <TabsTrigger value="bookmarks">
            <Bookmark className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toc" className="h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Table of Contents</h3>
              <div className="space-y-1">
                {toc.map((item, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                    onClick={() => {
                      onTocNavigate(item.href);
                      onClose();
                    }}
                  >
                    <span className="line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Notes</h3>
              <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground h-40">
                <p>Select text while reading to add notes</p>
                {highlights.length > 0 && (
                  <HighlightsMenu
                    highlights={highlights}
                    selectedColor="yellow"
                    onHighlightSelect={onHighlightSelect}
                    onRemoveHighlight={onRemoveHighlight}
                  />
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bookmarks" className="h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Bookmarks</h3>
              <BookmarksMenu
                currentLocation={currentLocation}
                onLocationSelect={onHighlightSelect}
                onBookmarkClick={onBookmarkClick}
                bookKey={bookKey}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <h3 className="font-semibold mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Font Size</h4>
                  <FontControls
                    fontSize={fontSize}
                    onFontSizeChange={onFontSizeChange}
                    fontFamily={fontFamily}
                    onFontFamilyChange={onFontFamilyChange}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Text Alignment</h4>
                  <AlignmentControls
                    textAlign={textAlign}
                    onTextAlignChange={onTextAlignChange}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Brightness</h4>
                  <BrightnessControl
                    brightness={brightness}
                    onBrightnessChange={onBrightnessChange}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Reading Session</h4>
                  <div className="flex items-center justify-center p-4 bg-background/50 rounded-lg">
                    <SessionTimer seconds={sessionTime} showIcon={true} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Chat with Virgil</h3>
              <div className="rounded-lg border border-border p-4 bg-background/50 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ask Virgil about the book you're reading. Get explanations, summaries, or just chat about the content.
                </p>
                <button 
                  className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm"
                  onClick={() => {
                    onClose();
                    // This will be handled by the parent component
                    window.dispatchEvent(new CustomEvent('openVirgilChat'));
                  }}
                >
                  Open Chat
                </button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReaderSidebar;
