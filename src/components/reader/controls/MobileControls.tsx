import React from 'react';
import { Menu, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import FontControls from './FontControls';
import AlignmentControls from './AlignmentControls';
import BrightnessControl from './BrightnessControl';
import BookmarkControls from './BookmarkControls';
import SessionTimer from '../SessionTimer';
import HighlightsMenu from '../HighlightsMenu';
import TableOfContents from '../TableOfContents';
import type { ReaderControlsProps } from '@/types/reader';

export const MobileControls = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  brightness,
  onBrightnessChange,
  currentLocation,
  onBookmarkClick,
  onLocationChange,
  sessionTime,
  highlights,
  selectedHighlightColor,
  onHighlightColorSelect,
  onRemoveHighlight,
  toc,
  onNavigate,
  bookKey
}: ReaderControlsProps & { bookKey: string | null }) => {
  const [showMobileTimer, setShowMobileTimer] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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
    <div className="md:hidden w-full flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="flex flex-col items-center gap-4 p-4">
              <FontControls
                fontSize={fontSize}
                onFontSizeChange={onFontSizeChange}
                fontFamily={fontFamily}
                onFontFamilyChange={onFontFamilyChange}
              />
              <AlignmentControls
                textAlign={textAlign}
                onTextAlignChange={onTextAlignChange}
              />
              <BrightnessControl
                brightness={brightness}
                onBrightnessChange={onBrightnessChange}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileTimer(!showMobileTimer)}
                className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
              >
                <SessionTimer seconds={sessionTime} showIcon={true} />
              </Button>
              {showMobileTimer && (
                <div className="w-full p-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg flex justify-center">
                  <SessionTimer seconds={sessionTime} className="text-lg" showIcon={false} />
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullScreen}
                className="h-10 w-10"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
        <TableOfContents toc={toc} onNavigate={onNavigate} />
        <HighlightsMenu
          highlights={highlights}
          selectedColor={selectedHighlightColor}
          onColorSelect={onHighlightColorSelect}
          onHighlightSelect={onLocationChange}
          onRemoveHighlight={onRemoveHighlight}
        />
      </div>
      
      <div className="md:hidden flex items-center gap-2">
        <BookmarkControls
          currentLocation={currentLocation}
          onBookmarkClick={onBookmarkClick}
          onLocationChange={onLocationChange}
          bookKey={bookKey}
        />
      </div>
    </div>
  );
};