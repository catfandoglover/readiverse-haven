import React from 'react';
import BookmarksMenu from './BookmarksMenu';

interface BookmarkControlsProps {
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationSelect?: (location: string) => void;
}

const BookmarkControls = ({
  currentLocation,
  onBookmarkClick,
  onLocationSelect,
}: BookmarkControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <BookmarksMenu 
        currentLocation={currentLocation} 
        onLocationSelect={onLocationSelect || (() => {})} 
        onBookmarkClick={onBookmarkClick}
      />
    </div>
  );
};

export default BookmarkControls;