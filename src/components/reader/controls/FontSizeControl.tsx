import React from 'react';
import { CustomSlider } from "./CustomSlider";
import { Minus, Plus } from "lucide-react";

interface FontSizeControlProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
}

const FontSizeControl = ({
  fontSize,
  onFontSizeChange,
}: FontSizeControlProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Font Size</h3>
      <div className="flex items-center gap-2">
        <Minus className="h-4 w-4 text-white/70" />
        <CustomSlider
          value={[fontSize]}
          onValueChange={onFontSizeChange}
          min={50}
          max={200}
          step={10}
          className="w-full"
        />
        <Plus className="h-4 w-4 text-white/70" />
      </div>
    </div>
  );
};

export default FontSizeControl; 