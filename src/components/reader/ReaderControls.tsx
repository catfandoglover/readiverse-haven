import React from 'react';
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import FontControls from './controls/FontControls';
import AlignmentControls from './controls/AlignmentControls';
import BrightnessControl from './controls/BrightnessControl';
import BookmarkControls from './controls/BookmarkControls';

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

const ControlPanel = (props: ReaderControlsProps) => {
  return (
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
    </div>
  );
};

const ReaderControls = (props: ReaderControlsProps) => {
  return (
    <>
      {/* Desktop bookmark controls */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 flex-col items-center gap-2">
        <BookmarkControls
          currentLocation={props.currentLocation}
          onBookmarkClick={props.onBookmarkClick}
          onLocationChange={props.onLocationChange}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
        <div className="hidden md:flex items-center flex-1 justify-center">
          <ControlPanel {...props} />
        </div>

        <div className="md:hidden w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="flex flex-col items-center gap-4 p-4">
                  <ControlPanel {...props} />
                </div>
              </DrawerContent>
            </Drawer>
            
            {/* Mobile bookmark controls - now horizontally aligned */}
            <BookmarkControls
              currentLocation={props.currentLocation}
              onBookmarkClick={props.onBookmarkClick}
              onLocationChange={props.onLocationChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderControls;