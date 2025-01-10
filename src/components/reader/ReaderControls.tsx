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
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
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
  isFullscreen,
  onFullscreenToggle,
}: ReaderControlsProps) => {
  return (
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

      <Button
        variant="outline"
        size="icon"
        onClick={onFullscreenToggle}
        className="h-8 w-8 rounded-full"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

const ReaderControls = (props: ReaderControlsProps) => {
  return (
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
            <ControlPanel {...props} />
          </DrawerContent>
        </Drawer>
        
        <div className="flex items-center gap-2">
          <BookmarksMenu onBookmarkSelect={props.onLocationChange || (() => {})} />
          <Button
            variant="outline"
            size="icon"
            onClick={props.onFullscreenToggle}
            className="h-8 w-8 rounded-full"
          >
            {props.isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReaderControls;