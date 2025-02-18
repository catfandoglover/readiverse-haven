
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
  onRemoveHighlight,
  toc,
  onNavigate,
  bookKey
}: ReaderControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-[#32303b] rounded-lg shadow border border-white/10">
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
        bookKey={bookKey}
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
        toc={toc}
        onNavigate={onNavigate}
        bookKey={bookKey}
      />
    </div>
  );
};

export default ReaderControls;
