import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import FontControls from './FontControls';
import AlignmentControls from './AlignmentControls';
import BrightnessControl from './BrightnessControl';
import SessionTimer from '../SessionTimer';
import BookmarkControls from './BookmarkControls';
import type { ReaderControlsProps } from '@/types/reader';

export const DesktopControls = (props: ReaderControlsProps) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <div className="hidden md:flex fixed top-4 right-4 z-50 flex-col items-center gap-2">
        <BookmarkControls
          currentLocation={props.currentLocation}
          onBookmarkClick={props.onBookmarkClick}
          onLocationChange={props.onLocationChange}
        />
      </div>

      <div className="hidden md:flex fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullScreen}
          className="h-10 w-10 shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="hidden md:flex items-center flex-1 justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
          <FontControls
            fontSize={props.fontSize}
            onFontSizeChange={props.onFontSizeChange}
            fontFamily={props.fontFamily}
            onFontFamilyChange={props.onFontFamilyChange}
          />
          <AlignmentControls
            textAlign={props.textAlign}
            onTextAlignChange={props.onTextAlignChange}
          />
          <BrightnessControl
            brightness={props.brightness}
            onBrightnessChange={props.onBrightnessChange}
          />
          <div className="hidden md:block">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
                >
                  <SessionTimer seconds={props.sessionTime} showIcon={true} />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4 flex justify-center">
                  <SessionTimer seconds={props.sessionTime} className="text-lg" showIcon={false} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
};