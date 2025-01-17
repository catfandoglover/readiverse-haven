import React, { useState } from 'react';
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  cfi: string;
  excerpt: string;
  percentage: number;
}

interface SearchDialogProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (cfi: string) => void;
}

const SearchDialog = ({ onSearch, onResultClick }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search in Book</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center mb-4">
          <Input
            placeholder="Enter search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            variant="secondary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            Search
          </Button>
        </div>
        {results.length > 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            Found {results.length} matches
          </div>
        )}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {results.map((result, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => {
                  onResultClick(result.cfi);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="font-medium mb-1">
                    Match {index + 1} ({Math.round(result.percentage * 100)}%)
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {result.excerpt}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;