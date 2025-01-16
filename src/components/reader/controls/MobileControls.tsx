import React from 'react';
import { Menu, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import FontControls from './FontControls';
import AlignmentControls from './AlignmentControls';
import BrightnessControl from './BrightnessControl';
import BookmarkControls from './BookmarkControls';
import SessionTimer from '../SessionTimer';
import type { ReaderControlsProps } from '@/types/reader';

export const MobileControls = (props: ReaderControlsProps) => {
  const [showMobileTimer, setShowMobileTimer] = React.useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="md:hidden w-full flex justify-between items-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="w-full grid grid-cols-2 gap-4">
              <FontControls
                fontSize={props.fontSize}
                onFontSizeChange={props.onFontSizeChange}
                fontFamily={props.fontFamily}
                onFontFamilyChange={props.onFontFamilyChange}
              />
              <div className="flex flex-col gap-4">
                <AlignmentControls
                  textAlign={props.textAlign}
                  onTextAlignChange={props.onTextAlignChange}
                />
                <BrightnessControl
                  brightness={props.brightness}
                  onBrightnessChange={props.onBrightnessChange}
                />
              </div>
            </div>
            
            <div className="w-full flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileTimer(!showMobileTimer)}
                className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
              >
                <SessionTimer seconds={props.sessionTime} showIcon={true} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullScreen}
                className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            
            {showMobileTimer && (
              <div className="w-full p-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg flex justify-center">
                <SessionTimer seconds={props.sessionTime} className="text-lg" showIcon={false} />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      <div className="md:hidden flex items-center">
        <BookmarkControls
          currentLocation={props.currentLocation}
          onBookmarkClick={props.onBookmarkClick}
          onLocationChange={props.onLocationChange}
        />
      </div>
    </div>
  );
};