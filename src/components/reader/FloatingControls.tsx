import ThemeSwitcher from './ThemeSwitcher';
import BookmarkControls from './BookmarkControls';
import HighlightsMenu from './HighlightsMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Highlight } from '@/types/highlight';

interface FloatingControlsProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  onBookmarkClick: () => void;
  highlights: Highlight[];
  selectedColor: 'yellow';
  onColorSelect: (color: 'yellow') => void;
  onHighlightSelect: (cfiRange: string) => void;
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
  const isMobile = useIsMobile();

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <div className={isMobile ? "hidden" : "block"}>
          <BookmarkControls
            currentLocation={currentLocation}
            onLocationSelect={onLocationSelect}
            onBookmarkClick={onBookmarkClick}
          />
        </div>
        <div className={isMobile ? "hidden" : "block"}>
          <HighlightsMenu
            highlights={highlights}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            onHighlightSelect={onHighlightSelect}
            onRemoveHighlight={onRemoveHighlight}
          />
        </div>
        <ThemeSwitcher />
      </div>
    </>
  );
};

export default FloatingControls;