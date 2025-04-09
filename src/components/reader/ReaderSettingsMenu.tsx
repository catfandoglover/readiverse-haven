import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Type,
  Sun,
  Bookmark,
  Highlighter,
  Maximize,
  StickyNote,
  FileSearch,
  Trash2
} from "lucide-react";
import BrightnessControl from "./controls/BrightnessControl";
import FontSelector from "./controls/FontSelector";
import SessionTimer from "./SessionTimer";
import TableOfContents from "./TableOfContents";
import HighlightsList from "./HighlightsList";
import BookmarksList from "./BookmarksList";
import InlineSearch from "./InlineSearch";
import { useNavigate } from "react-router-dom";
import SearchDialog from "./SearchDialog";
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import type { SearchResult } from '@/types/reader';
import { useToast } from "@/hooks/use-toast";
import { useNotes } from '@/hooks/useNotes';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReaderSettingsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fontSize: number;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  textAlign: 'left' | 'justify' | 'center';
  brightness: number;
  currentLocation: string | null;
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
  setSelectedColor: (color: 'yellow') => void;
  removeHighlight: (id: string) => void;
  bookKey: string | null;
  onTocNavigate: (href: string) => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSearchResultClick: (result: SearchResult) => void;
}

const ReaderSettingsMenu: React.FC<ReaderSettingsMenuProps> = ({
  open,
  onOpenChange,
  fontSize,
  fontFamily,
  textAlign,
  brightness,
  currentLocation,
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
  setSelectedColor,
  removeHighlight,
  bookKey,
  onTocNavigate,
  onSearch,
  onSearchResultClick
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("toc");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bookmarksListRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Get notes using the useNotes hook
  const { notes, removeNote } = useNotes(bookKey);
  
  // Debug logs
  useEffect(() => {
    console.log('Notes in ReaderSettingsMenu:', notes);
  }, [notes]);
  
  // Listen for note changes
  useEffect(() => {
    const handleNoteAdded = () => {
      // Force a re-render when notes change
      setActiveTab(prevTab => prevTab);
    };
    
    window.addEventListener('noteAdded', handleNoteAdded);
    
    return () => {
      window.removeEventListener('noteAdded', handleNoteAdded);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fetch book details using the slug from the URL
  const { data: bookDetails } = useQuery({
    queryKey: ['book-details', bookKey],
    queryFn: async () => {
      // Extract the book slug from the current URL
      const pathParts = window.location.pathname.split('/');
      const hasBooksPath = pathParts.includes('read');
      const slug = hasBooksPath ? pathParts[pathParts.indexOf('read') + 1] : pathParts[pathParts.length - 1];
      
      if (!slug) return null;

      const { data, error } = await supabase
        .from('books')
        .select('about, title')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching book details:', error);
        return null;
      }

      return data;
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md bg-[#221F26] text-white border-l border-white/10 rounded-l-2xl">
        <SheetHeader>
          <SheetTitle className="text-white text-sm tracking-wider uppercase font-oxanium font-bold text-center">SETTINGS</SheetTitle>
        </SheetHeader>
        
        <Tabs 
          defaultValue="toc" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid grid-cols-4 mb-4 bg-[#332E38] rounded-2xl p-1">
            <TabsTrigger value="toc" className="text-white data-[state=active]:bg-[#373763] rounded-xl">
              <BookOpen className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-white data-[state=active]:bg-[#373763] rounded-xl">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-white data-[state=active]:bg-[#373763] rounded-xl">
              <Bookmark className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="more" className="text-white data-[state=active]:bg-[#373763] rounded-xl">
              <Highlighter className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="toc" className="pt-4 px-1 flex flex-col">
            <div style={{ maxHeight: "40vh", overflow: "auto" }}>
              <TableOfContents 
                toc={toc} 
                onNavigate={onTocNavigate} 
                variant="inline" 
              />
            </div>
            
            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Book Details</h3>
              <p className="text-sm text-white/80 mt-3 mb-4">
                {bookDetails?.about || "No description available."}
              </p>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 rounded-2xl mt-4"
                onClick={() => {
                  onOpenChange(false);
                  
                  // Extract the book slug from the current URL
                  const pathParts = window.location.pathname.split('/');
                  const hasBooksPath = pathParts.includes('read');
                  const slug = hasBooksPath ? pathParts[pathParts.indexOf('read') + 1] : pathParts[pathParts.length - 1];
                  
                  // Try to navigate to the book detail view if we have a slug
                  if (slug && slug.length > 0) {
                    navigate(`/texts/${slug}`);
                  } else {
                    // If we couldn't extract the slug, fall back to bookshelf
                    navigate('/bookshelf');
                  }
                }}
              >
                Return to Book Details
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-8 px-1 pt-4">
            <BrightnessControl
              brightness={brightness}
              onBrightnessChange={onBrightnessChange}
            />
            
            <FontSelector
              fontFamily={fontFamily}
              onFontFamilyChange={onFontFamilyChange}
              fontSize={fontSize}
              onFontSizeChange={onFontSizeChange}
            />
            
            <div>
              <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Display Mode</h3>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 flex items-center rounded-2xl mt-6"
                onClick={toggleFullScreen}
              >
                <Maximize className="h-4 w-4 mr-2" />
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-8 px-1 pt-4">
            <div>
              <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Search</h3>
              <div className="mt-6">
                <InlineSearch 
                  onSearch={onSearch}
                  onResultClick={onSearchResultClick}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Bookmarks</h3>
                <button 
                  className="text-xs font-oxanium uppercase tracking-wider font-bold text-white/70 hover:text-white flex items-center gap-1"
                  onClick={() => {
                    if (bookmarksListRef.current && typeof bookmarksListRef.current.__clearAll === 'function') {
                      bookmarksListRef.current.__clearAll();
                    }
                  }}
                >
                  <span>Clear All</span>
                </button>
              </div>
              <div className="mt-6">
                <BookmarksList 
                  ref={bookmarksListRef}
                  currentLocation={currentLocation} 
                  onLocationSelect={onLocationChange}
                  bookKey={bookKey}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="more" className="space-y-8 px-1 pt-4">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Highlights</h3>
                <button 
                  className="text-xs font-oxanium uppercase tracking-wider font-bold text-white/70 hover:text-white flex items-center gap-1"
                  onClick={() => {
                    if (highlights.length > 0 && removeHighlight) {
                      // Remove all highlights for this book
                      highlights
                        .filter(h => h.bookKey === bookKey)
                        .forEach(h => removeHighlight(h.id));
                    }
                  }}
                >
                  <span>Clear All</span>
                </button>
              </div>
              <div className="mt-6">
                <HighlightsList
                  highlights={highlights}
                  notes={notes}
                  currentLocation={currentLocation}
                  onHighlightSelect={onLocationChange}
                  onRemoveHighlight={removeHighlight}
                  onRemoveNote={removeNote}
                  bookKey={bookKey}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ReaderSettingsMenu;
