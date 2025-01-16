import React, { useState } from 'react';
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
  const [showMobileTimer, setShowMobileTimer] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="md:hidden w-full">
      <div className="flex justify-end items-center gap-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="flex flex-col items-center gap-4 p-4">
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
            </div>
          </DrawerContent>
        </Drawer>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMobileTimer(!showMobileTimer)}
        >
          <SessionTimer seconds={props.sessionTime} showIcon={true} />
        </Button>

        <BookmarkControls
          currentLocation={props.currentLocation}
          onBookmarkClick={props.onBookmarkClick}
          onLocationChange={props.onLocationChange}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullScreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {showMobileTimer && (
        <div className="mt-2 p-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg flex justify-center">
          <SessionTimer seconds={props.sessionTime} className="text-sm" showIcon={false} />
        </div>
      )}
    </div>
  );
};