import React from 'react';
import BookmarksMenu from './BookmarksMenu';

interface BookmarkControlsProps {
  currentLocation: string | null;
  onBookmarkClick: () => void;
  onLocationSelect?: (location: string) => void;
  bookKey?: string | null;
}

const BookmarkControls = ({
  currentLocation,
  onBookmarkClick,
  onLocationSelect,
  bookKey,
}: BookmarkControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <BookmarksMenu 
        currentLocation={currentLocation} 
        onLocationSelect={onLocationSelect || (() => {})} 
        onBookmarkClick={onBookmarkClick}
        bookKey={bookKey}
      />
    </div>
  );
};

export default BookmarkControls;