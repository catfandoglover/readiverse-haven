import React from 'react';
import { Button } from "@/components/ui/button";
import { AlignLeft, AlignCenter, AlignJustify } from "lucide-react";

interface AlignmentControlsProps {
  textAlign: 'left' | 'justify' | 'center';
  onTextAlignChange: (value: 'left' | 'justify' | 'center') => void;
}

const AlignmentControls = ({
  textAlign,
  onTextAlignChange,
}: AlignmentControlsProps) => {
  return (
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
  );
};

export default AlignmentControls;