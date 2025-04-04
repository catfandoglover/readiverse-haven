
import React, { useState } from 'react';
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
  FileSearch
} from "lucide-react";
import FontControls from "./controls/FontControls";
import AlignmentControls from "./controls/AlignmentControls";
import BrightnessControl from "./controls/BrightnessControl";
import SessionTimer from "./SessionTimer";
import TableOfContents from "./TableOfContents";
import HighlightsMenu from "./HighlightsMenu";
import BookmarksMenu from "./BookmarksMenu";
import { useNavigate } from "react-router-dom";
import SearchDialog from "./SearchDialog";
import type { NavItem } from 'epubjs';
import type { Highlight, HighlightColor } from '@/types/highlight';
import type { SearchResult } from '@/types/reader';

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md bg-[#221F26] text-white border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white">Reader Settings</SheetTitle>
          <SheetDescription className="text-white/70">
            Customize your reading experience
          </SheetDescription>
        </SheetHeader>
        
        <Tabs 
          defaultValue="toc" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid grid-cols-4 mb-4 bg-[#332E38]">
            <TabsTrigger value="toc" className="text-white data-[state=active]:bg-[#4A4351]">
              <BookOpen className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-white data-[state=active]:bg-[#4A4351]">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-white data-[state=active]:bg-[#4A4351]">
              <Bookmark className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="more" className="text-white data-[state=active]:bg-[#4A4351]">
              <Highlighter className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="toc" className="h-[70vh] overflow-y-auto">
            <div className="mb-4">
              <TableOfContents toc={toc} onNavigate={onTocNavigate} />
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Text Appearance</h3>
              <FontControls
                fontSize={fontSize}
                onFontSizeChange={onFontSizeChange}
                fontFamily={fontFamily}
                onFontFamilyChange={onFontFamilyChange}
              />
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Text Alignment</h3>
              <AlignmentControls
                textAlign={textAlign}
                onTextAlignChange={onTextAlignChange}
              />
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Brightness</h3>
              <BrightnessControl
                brightness={brightness}
                onBrightnessChange={onBrightnessChange}
              />
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Reading Session</h3>
              <div className="bg-[#332E38] p-4 rounded-md">
                <SessionTimer seconds={sessionTime} className="text-lg" showIcon={false} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Bookmarks</h3>
              <div className="bg-[#332E38] p-4 rounded-md">
                <BookmarksMenu 
                  currentLocation={currentLocation} 
                  onLocationSelect={onLocationChange} 
                  onBookmarkClick={onBookmarkClick}
                  bookKey={bookKey}
                />
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Notes (Coming Soon)</h3>
              <div className="bg-[#332E38] p-4 rounded-md text-white/50 flex items-center">
                <StickyNote className="h-4 w-4 mr-2" />
                <span>Notes feature will be available soon</span>
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Search</h3>
              <div className="bg-[#332E38] p-4 rounded-md">
                <SearchDialog 
                  onSearch={onSearch}
                  onResultClick={onSearchResultClick}
                  variant="minimal"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="more" className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Highlights</h3>
              <div className="bg-[#332E38] p-4 rounded-md">
                <HighlightsMenu
                  highlights={highlights}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  onHighlightSelect={onLocationChange}
                  onRemoveHighlight={removeHighlight}
                />
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Display Mode</h3>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 flex items-center"
                onClick={toggleFullScreen}
              >
                <Maximize className="h-4 w-4 mr-2" />
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </Button>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Book Details</h3>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  onOpenChange(false);
                  const pathParts = window.location.pathname.split('/');
                  const bookSlug = pathParts[pathParts.length - 1];
                  navigate(`/discover/book/${bookSlug}`);
                }}
              >
                Return to Book Details
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ReaderSettingsMenu;
