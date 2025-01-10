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
import { AlignLeft, AlignCenter, AlignJustify, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  fontFamily: 'georgia' | 'helvetica' | 'times';
  onFontFamilyChange: (value: 'georgia' | 'helvetica' | 'times') => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  coverUrl?: string;
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
}

const ReaderControls = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  onPrevPage,
  onNextPage,
  coverUrl,
  textAlign,
  onTextAlignChange,
  brightness,
  onBrightnessChange
}: ReaderControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2">
        <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt="Book cover" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.innerHTML = '<div class="text-gray-400"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>';
                  parent.appendChild(fallbackIcon);
                }
              }}
            />
          ) : (
            <BookOpen className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onPrevPage}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextPage}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Font Size</span>
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
          <span className="text-sm font-medium">Brightness</span>
          <Slider
            value={[brightness]}
            onValueChange={onBrightnessChange}
            min={0.2}
            max={1}
            step={0.1}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
};

export default ReaderControls;