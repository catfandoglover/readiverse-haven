import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search in Book</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 my-4">
          <Input
            placeholder="Enter search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <ScrollArea className="max-h-[300px]">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-3 hover:bg-accent rounded-lg cursor-pointer mb-2"
              onClick={() => onResultClick(result.cfi)}
            >
              <div className="text-sm opacity-70 mb-1">
                {Math.round(result.percentage * 100)}% through book
              </div>
              <div className="text-sm">
                ...{result.excerpt}...
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;