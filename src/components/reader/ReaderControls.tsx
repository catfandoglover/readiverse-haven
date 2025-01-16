import React from 'react';
import { DesktopControls } from './controls/DesktopControls';
import { MobileControls } from './controls/MobileControls';
import HighlightsMenu from './HighlightsMenu';
import type { ReaderControlsProps } from '@/types/reader';

const ReaderControls = (props: ReaderControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <DesktopControls {...props} />
      <MobileControls {...props} />
      <HighlightsMenu 
        highlights={props.highlights}
        onHighlightSelect={props.onLocationChange || (() => {})}
        onRemoveHighlight={props.onRemoveHighlight}
        currentColor={props.currentHighlightColor}
        onColorChange={props.onHighlightColorChange}
      />
    </div>
  );
};

export default ReaderControls;