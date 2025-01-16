import ThemeSwitcher from './ThemeSwitcher';
import BookmarkControls from './BookmarkControls';
import HighlightsMenu from './HighlightsMenu';
import type { Highlight } from '@/types/highlight';

interface FloatingControlsProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  onBookmarkClick: () => void;
  highlights: Highlight[];
  selectedColor: 'yellow';
  onColorSelect: (color: 'yellow') => void;
  onHighlightSelect: (location: string) => void;
  onRemoveHighlight: (id: string) => void;
}

const FloatingControls = ({
  currentLocation,
  onLocationSelect,
  onBookmarkClick,
  highlights,
  selectedColor,
  onColorSelect,
  onHighlightSelect,
  onRemoveHighlight
}: FloatingControlsProps) => {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <div className="hidden md:block">
          <BookmarkControls
            currentLocation={currentLocation}
            onLocationSelect={onLocationSelect}
            onBookmarkClick={onBookmarkClick}
          />
        </div>
        <div className="hidden md:block">
          <HighlightsMenu
            highlights={highlights}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            onHighlightSelect={onHighlightSelect}
            onRemoveHighlight={onRemoveHighlight}
          />
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
    </>
  );
};

export default FloatingControls;