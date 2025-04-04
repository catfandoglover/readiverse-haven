import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomSlider } from "./CustomSlider";
import { Minus, Plus } from "lucide-react";

interface FontSelectorProps {
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
}

const FontSelector = ({
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange
}: FontSelectorProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Font</h3>
      
      {/* Font Size Slider */}
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
      
      {/* Font Family Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFontFamilyChange('lexend')}
          className={cn(
            "rounded-2xl h-10 border-0 hover:bg-white/10",
            fontFamily === 'lexend' ? "bg-[#373763]" : "bg-transparent"
          )}
        >
          <span className="font-lexend">Lexend</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFontFamilyChange('georgia')}
          className={cn(
            "rounded-2xl h-10 border-0 hover:bg-white/10",
            fontFamily === 'georgia' ? "bg-[#373763]" : "bg-transparent"
          )}
        >
          <span className="font-libre-baskerville">Libre</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFontFamilyChange('helvetica')}
          className={cn(
            "rounded-2xl h-10 border-0 hover:bg-white/10",
            fontFamily === 'helvetica' ? "bg-[#373763]" : "bg-transparent"
          )}
        >
          <span className="font-oxanium">Oxanium</span>
        </Button>
      </div>
    </div>
  );
};

export default FontSelector; 