import React from 'react';
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FontControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
}

const FontControls = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
}: FontControlsProps) => {
  return (
    <>
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
          onValueChange={(value: 'lexend' | 'georgia' | 'helvetica' | 'times') => onFontFamilyChange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lexend">Lexend</SelectItem>
            <SelectItem value="georgia">Georgia</SelectItem>
            <SelectItem value="helvetica">Helvetica</SelectItem>
            <SelectItem value="times">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default FontControls;