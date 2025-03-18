
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Search } from "lucide-react";
import SearchDialog from "./SearchDialog";
import type { SearchResult } from '@/types/reader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="mb-4 flex items-center gap-4">
      <div className="flex-1">
        {externalLink && (
          <Button
            onClick={() => window.open(externalLink, '_blank')}
            variant="outline"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Lightning</span>
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      <div className="flex-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SearchDialog 
                onSearch={onSearch}
                onResultClick={onSearchResultClick}
                triggerClassName="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 hover:bg-background/70 text-foreground transition-colors shadow-md backdrop-blur-sm border border-border/10"
                triggerIcon={<Search className="h-5 w-5" />}
              />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ReaderHeader;
