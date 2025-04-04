
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { SearchResult } from '@/types/reader';

interface SearchDialogProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
  variant?: 'default' | 'minimal';
}

const SearchDialog: React.FC<SearchDialogProps> = ({ 
  onSearch, 
  onResultClick,
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === 'minimal' ? (
          <Button 
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10 flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Search in Book
          </Button>
        ) : (
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className={variant === 'minimal' ? "bg-[#221F26] text-white border border-white/10" : ""}
      >
        <DialogHeader>
          <DialogTitle className={variant === 'minimal' ? "text-white" : ""}>
            Search in Book
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch}>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter search term..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={variant === 'minimal' ? "bg-[#332E38] text-white border-white/10" : ""}
            />
            <Button 
              type="submit" 
              disabled={isSearching}
              className={variant === 'minimal' ? "bg-[#4A4351] text-white hover:bg-[#4A4351]/90" : ""}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {results.length === 0 ? (
            isSearching ? (
              <p className={variant === 'minimal' ? "text-white/70" : "text-muted-foreground"}>
                Searching...
              </p>
            ) : query ? (
              <p className={variant === 'minimal' ? "text-white/70" : "text-muted-foreground"}>
                No results found
              </p>
            ) : (
              <p className={variant === 'minimal' ? "text-white/70" : "text-muted-foreground"}>
                Enter a search term to find text in the book
              </p>
            )
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md cursor-pointer ${
                    variant === 'minimal' 
                      ? "bg-[#332E38] hover:bg-[#4A4351] text-white" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => {
                    onResultClick(result);
                    setIsOpen(false);
                  }}
                >
                  <div className={variant === 'minimal' ? "text-white/70 text-xs mb-1" : "text-muted-foreground text-xs mb-1"}>
                    {result.chapterTitle}
                  </div>
                  <div 
                    className="text-sm" 
                    dangerouslySetInnerHTML={{
                      __html: result.excerpt.replace(
                        new RegExp(query, 'gi'),
                        (match) => `<span class="${
                          variant === 'minimal' ? "bg-[#CCFF33] text-[#221F26]" : "bg-yellow-200 text-black"
                        } px-1">${match}</span>`
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
