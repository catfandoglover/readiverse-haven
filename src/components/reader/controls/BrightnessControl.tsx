import React from 'react';
import { CustomSlider } from "./CustomSlider";

interface BrightnessControlProps {
  brightness: number;
  onBrightnessChange: (value: number[]) => void;
}

const BrightnessControl = ({
  brightness,
  onBrightnessChange,
}: BrightnessControlProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-oxanium uppercase tracking-wider font-bold">Brightness</h3>
      <CustomSlider
        value={[brightness]}
        onValueChange={onBrightnessChange}
        min={0.2}
        max={1}
        step={0.1}
        className="w-full mt-6"
      />
    </div>
  );
};

export default BrightnessControl;