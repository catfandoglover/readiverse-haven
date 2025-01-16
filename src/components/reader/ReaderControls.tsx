import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignJustify, Menu, Bookmark, Maximize2, Minimize2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import BookmarksMenu from './BookmarksMenu';
import { useToast } from "@/components/ui/use-toast";

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'georgia' | 'helvetica' | 'times') => void;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationChange?: (location: string) => void;
}

const ControlPanel = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  brightness,
  onBrightnessChange,
}: ReaderControlsProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        toast({
          description: "Entered fullscreen mode",
        });
      }).catch(err => {
        toast({
          variant: "destructive",
          description: "Error entering fullscreen mode",
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        toast({
          description: "Exited fullscreen mode",
        });
      }).catch(err => {
        toast({
          variant: "destructive",
          description: "Error exiting fullscreen mode",
        });
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Font Size</span>
          <Slider
            value={[fontSize]}
            onValueChange={onFontSizeChange}
            min={50}
            max={200}
            step={10}
            className="w-32"
          />
        </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Font</span>
        <Select
          value={fontFamily}
          onValueChange={(value: 'georgia' | 'helvetica' | 'times') => onFontFamilyChange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="georgia">Georgia</SelectItem>
            <SelectItem value="helvetica">Helvetica</SelectItem>
            <SelectItem value="times">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={textAlign === 'left' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onTextAlignChange('left')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === 'justify' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onTextAlignChange('justify')}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === 'center' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onTextAlignChange('center')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
      </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Brightness</span>
          <Slider
            value={[brightness]}
            onValueChange={onBrightnessChange}
            min={0.2}
            max={1}
            step={0.1}
            className="w-32"
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleFullscreen}
        className="fixed bottom-4 left-4 z-50"
      >
        {isFullscreen ? <Minimize2 className="h-[1.2rem] w-[1.2rem]" /> : <Maximize2 className="h-[1.2rem] w-[1.2rem]" />}
      </Button>
    </>
  );
};

const BookmarkButton = ({ currentLocation, onBookmarkClick }: Pick<ReaderControlsProps, 'currentLocation' | 'onBookmarkClick'>) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = () => {
      if (currentLocation) {
        const bookmarkExists = localStorage.getItem(`book-progress-${currentLocation}`) !== null;
        setIsBookmarked(bookmarkExists);
      }
    };

    checkBookmark();
    window.addEventListener('storage', checkBookmark);
    return () => window.removeEventListener('storage', checkBookmark);
  }, [currentLocation]);

  const handleBookmarkClick = () => {
    if (!currentLocation) return;

    if (isBookmarked) {
      onBookmarkClick(); // Show confirmation dialog for removal
    } else {
      localStorage.setItem(`book-progress-${currentLocation}`, currentLocation);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBookmarkClick}
      className="text-red-500 hover:text-red-600"
    >
      <Bookmark 
        className="h-4 w-4" 
        fill={isBookmarked ? "currentColor" : "none"} 
        stroke={isBookmarked ? "currentColor" : "currentColor"}
      />
    </Button>
  );
};

const ReaderControls = (props: ReaderControlsProps) => {
  return (
    <>
      {/* Desktop bookmark controls */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 flex-col items-center gap-2">
        <BookmarkButton currentLocation={props.currentLocation} onBookmarkClick={props.onBookmarkClick} />
        <BookmarksMenu onBookmarkSelect={props.onLocationChange || (() => {})} />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
        <div className="hidden md:flex items-center flex-1 justify-center">
          <ControlPanel {...props} />
        </div>

        <div className="md:hidden w-full flex justify-between items-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="flex flex-col items-center gap-4 p-4">
                <ControlPanel {...props} />
                <div className="flex items-center gap-2">
                  <BookmarkButton currentLocation={props.currentLocation} onBookmarkClick={props.onBookmarkClick} />
                  <BookmarksMenu onBookmarkSelect={props.onLocationChange || (() => {})} />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          
          {/* Mobile bookmark controls */}
          <div className="flex items-center gap-2">
            <BookmarkButton currentLocation={props.currentLocation} onBookmarkClick={props.onBookmarkClick} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderControls;
