
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import FloatingActionButton from './FloatingActionButton';
import SearchDialog from './SearchDialog';

interface NavigationButtonsProps {
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onSearch?: (query: string) => Promise<any[]>;
  onSearchResultClick?: (result: any) => void;
}

const NavigationButtons = ({
  onPrevPage,
  onNextPage,
  onSearch,
  onSearchResultClick
}: NavigationButtonsProps) => {
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-40 flex flex-row gap-2">
        <FloatingActionButton
          icon={ChevronLeft}
          onClick={onPrevPage || (() => {})}
          tooltip="Previous Page"
        />
        <FloatingActionButton
          icon={ChevronRight}
          onClick={onNextPage || (() => {})}
          tooltip="Next Page"
        />
        <FloatingActionButton
          icon={Search}
          onClick={() => setShowSearchDialog(true)}
          tooltip="Search"
        />
      </div>

      {onSearch && onSearchResultClick && (
        <SearchDialog
          open={showSearchDialog}
          onOpenChange={setShowSearchDialog}
          onSearch={onSearch}
          onResultClick={onSearchResultClick}
        />
      )}
    </>
  );
};

export default NavigationButtons;
