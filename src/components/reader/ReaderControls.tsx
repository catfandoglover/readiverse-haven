import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlignLeft, AlignCenter, AlignJustify, Menu, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'georgia' | 'helvetica' | 'times') => void;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
  lineHeight: number;
  onLineHeightChange: (value: number[]) => void;
  margins: Margins;
  onMarginsChange: (type: keyof Margins, value: number[]) => void;
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
  lineHeight,
  onLineHeightChange,
  margins,
  onMarginsChange
}: ReaderControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4">
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

      <Collapsible className="w-full md:w-auto">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            More options <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Line Spacing</span>
            <Slider
              value={[lineHeight]}
              onValueChange={onLineHeightChange}
              min={1}
              max={2.5}
              step={0.1}
              className="w-32"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Margins</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Top</span>
                <Slider
                  value={[margins.top]}
                  onValueChange={(value) => onMarginsChange('top', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Right</span>
                <Slider
                  value={[margins.right]}
                  onValueChange={(value) => onMarginsChange('right', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Bottom</span>
                <Slider
                  value={[margins.bottom]}
                  onValueChange={(value) => onMarginsChange('bottom', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Left</span>
                <Slider
                  value={[margins.left]}
                  onValueChange={(value) => onMarginsChange('left', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const ReaderControls = (props: ReaderControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <div className="hidden md:flex items-center flex-1 justify-center">
        <ControlPanel {...props} />
      </div>

      <div className="md:hidden w-full">
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
      </div>
    </div>
  );
};

export default ReaderControls;