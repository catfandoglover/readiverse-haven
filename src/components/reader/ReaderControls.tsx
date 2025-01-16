import React from 'react';
import { DesktopControls } from './controls/DesktopControls';
import { MobileControls } from './controls/MobileControls';
import type { ReaderControlsProps } from '@/types/reader';

const ReaderControls = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  brightness,
  onBrightnessChange,
  currentLocation,
  onBookmarkClick,
  onLocationChange,
  sessionTime,
  highlights,
  selectedHighlightColor,
  onHighlightColorSelect,
  onHighlightSelect,
  onRemoveHighlight
}: ReaderControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <DesktopControls 
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        textAlign={textAlign}
        onTextAlignChange={onTextAlignChange}
        brightness={brightness}
        onBrightnessChange={onBrightnessChange}
        currentLocation={currentLocation}
        onBookmarkClick={onBookmarkClick}
        onLocationChange={onLocationChange}
        sessionTime={sessionTime}
        highlights={highlights}
        selectedHighlightColor={selectedHighlightColor}
        onHighlightColorSelect={onHighlightColorSelect}
        onHighlightSelect={onHighlightSelect}
        onRemoveHighlight={onRemoveHighlight}
      />
      <MobileControls 
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        textAlign={textAlign}
        onTextAlignChange={onTextAlignChange}
        brightness={brightness}
        onBrightnessChange={onBrightnessChange}
        currentLocation={currentLocation}
        onBookmarkClick={onBookmarkClick}
        onLocationChange={onLocationChange}
        sessionTime={sessionTime}
        highlights={highlights}
        selectedHighlightColor={selectedHighlightColor}
        onHighlightColorSelect={onHighlightColorSelect}
        onHighlightSelect={onHighlightSelect}
        onRemoveHighlight={onRemoveHighlight}
      />
    </div>
  );
};

export default ReaderControls;