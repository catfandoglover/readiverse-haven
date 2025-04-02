import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult } from "@/types/reader";

interface SearchDialogProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
}

const SearchDialog = ({ onSearch, onResultClick }: SearchDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          description: "No results found",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        description: "Failed to perform search",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search through the book's content. Press Enter or click the search icon to begin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Input
              placeholder="Enter search term..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pr-8 rounded-xl"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            size="icon"
            className="shrink-0 rounded-full"
          >
            {isSearching ? (
              <div className="animate-spin">⌛</div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {results.length > 0 && (
          <>
            <ScrollArea className="h-[300px] mt-4">
              <div className="space-y-1">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-accent rounded-md transition-colors flex flex-col gap-1"
                  >
                    <span className="text-sm font-bold font-baskerville">
                      {result.chapterTitle || `Chapter ${Math.floor(index / 5) + 1}`}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-oxanium">
                        Page {index + 1}
                      </span>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-oxanium">
                        {result.excerpt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 text-center text-sm text-muted-foreground font-oxanium">
              {results.length} matches found
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
