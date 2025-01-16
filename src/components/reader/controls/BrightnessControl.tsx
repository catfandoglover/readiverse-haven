import React from 'react';
import { Slider } from "@/components/ui/slider";

interface BrightnessControlProps {
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
}

const BrightnessControl = ({
  brightness,
  onBrightnessChange,
}: BrightnessControlProps) => {
  return (
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
  );
};

export default BrightnessControl;