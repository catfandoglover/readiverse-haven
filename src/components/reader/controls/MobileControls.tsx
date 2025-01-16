import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FontControls from './FontControls';
import AlignmentControls from './AlignmentControls';
import BrightnessControl from './BrightnessControl';
import BookmarkControls from './BookmarkControls';
import HighlightsMenu from '../HighlightsMenu';
import SessionTimer from '../SessionTimer';
import type { ReaderControlsProps } from '@/types/reader';

export const MobileControls = (props: ReaderControlsProps) => {
  return (
    <div className="md:hidden w-full flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => {}}
                className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
              >
                <SessionTimer seconds={props.sessionTime} showIcon={true} />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex items-center gap-2">
        <HighlightsMenu
          highlights={props.highlights}
          selectedColor={props.selectedHighlightColor}
          onColorSelect={props.onHighlightColorSelect}
          onHighlightSelect={props.onHighlightSelect}
          onRemoveHighlight={props.onRemoveHighlight}
        />
      </div>
    </div>
  );
};