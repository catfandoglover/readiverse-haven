
import BookmarkControls from './BookmarkControls';
import HighlightsMenu from './HighlightsMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Highlight } from '@/types/highlight';
import SearchDialog from './SearchDialog';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface FloatingControlsProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  onBookmarkClick: () => void;
  highlights: Highlight[];
  selectedColor: 'yellow';
  onColorSelect: (color: 'yellow') => void;
  onHighlightSelect: (cfiRange: string) => void;
  onRemoveHighlight: (id: string) => void;
  bookKey: string | null;
  onSearch?: (query: string) => Promise<any[]>;
  onSearchResultClick?: (result: any) => void;
}

const FloatingControls = ({
  currentLocation,
  onLocationSelect,
  onBookmarkClick,
  highlights,
  selectedColor,
  onColorSelect,
  onHighlightSelect,
  onRemoveHighlight,
  bookKey,
  onSearch,
  onSearchResultClick
}: FloatingControlsProps) => {
  const isMobile = useIsMobile();
  const [hoveredSearch, setHoveredSearch] = useState(false);

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <div className={isMobile ? "hidden" : "block"}>
          <BookmarkControls
            currentLocation={currentLocation}
            onLocationSelect={onLocationSelect}
            onBookmarkClick={onBookmarkClick}
            bookKey={bookKey}
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
      </div>
      
      {onSearch && onSearchResultClick && (
        <div className="fixed bottom-4 left-4 z-50">
          <SearchDialog
            onSearch={onSearch}
            onResultClick={onSearchResultClick}
            triggerClassName={`h-10 w-10 rounded-full shadow-sm bg-background/40 backdrop-blur-sm border-0 hover:bg-background/80 
                           transition-all duration-300 ease-in-out ${hoveredSearch ? 'bg-background/70 transform scale-105' : ''}`}
            triggerIcon={<Search className="h-5 w-5" />}
            onTriggerMouseEnter={() => setHoveredSearch(true)}
            onTriggerMouseLeave={() => setHoveredSearch(false)}
          />
        </div>
      )}
    </>
  );
};

export default FloatingControls;
