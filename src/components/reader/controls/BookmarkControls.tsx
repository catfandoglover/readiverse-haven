import React from 'react';
import BookmarkButton from '../BookmarkButton';
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
      <BookmarkButton 
        currentLocation={currentLocation} 
        onBookmarkClick={onBookmarkClick} 
      />
      <BookmarksMenu 
        currentLocation={currentLocation} 
        onLocationSelect={onLocationChange || (() => {})} 
      />
    </div>
  );
};

export default BookmarkControls;