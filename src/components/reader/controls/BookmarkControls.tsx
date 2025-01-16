import React from 'react';
import BookmarksMenu from '../BookmarksMenu';

interface BookmarkControlsProps {
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationChange?: (location: string) => void;
}

const BookmarkControls = ({
  currentLocation,
  onBookmarkClick,
  onLocationChange,
}: BookmarkControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <BookmarksMenu 
        currentLocation={currentLocation} 
        onLocationSelect={onLocationChange || (() => {})} 
        onBookmarkClick={onBookmarkClick}
      />
    </div>
  );
};

export default BookmarkControls;