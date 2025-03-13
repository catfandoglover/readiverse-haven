
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
      <div className="flex-none flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            // Open AI chat if available
            const chatButton = document.querySelector('[data-test-id="ai-chat-button"]');
            if (chatButton) {
              (chatButton as HTMLButtonElement).click();
            }
          }}
          title="Chat with Virgil"
        >
          <div className="virgil-icon-container-small">
            <img 
              src="/lovable-uploads/c45050c7-56af-4b5c-9305-d0e18c64a826.png" 
              alt="Virgil" 
              className="virgil-icon-small"
            />
          </div>
        </Button>
        <SearchDialog 
          onSearch={onSearch}
          onResultClick={onSearchResultClick}
        />
      </div>
    </div>
  );
};

export default ReaderHeader;
