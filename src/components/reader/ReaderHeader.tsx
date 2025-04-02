import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, MessageSquare } from "lucide-react";
import SearchDialog from "./SearchDialog";
import type { SearchResult } from '@/types/reader';
import { useAuth } from "@/contexts/SupabaseAuthContext";

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
          <MessageSquare className="h-4 w-4" />
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
