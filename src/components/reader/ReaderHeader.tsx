import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import SearchDialog from "./SearchDialog";
import type { SearchResult } from '@/types/reader';

interface ReaderHeaderProps {
  externalLink: string | null;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSearchResultClick: (result: SearchResult) => void;
}

const ReaderHeader = ({
  externalLink,
  onSearch,
  onSearchResultClick
}: ReaderHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      {externalLink && (
        <Button
          onClick={() => window.open(externalLink, '_blank')}
          variant="outline"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Book Cover</span>
          <ExternalLink className="h-4 w-4 ml-1" />
        </Button>
      )}
      <SearchDialog 
        onSearch={onSearch}
        onResultClick={onSearchResultClick}
      />
    </div>
  );
};

export default ReaderHeader;