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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle?: string;
}

interface SearchDialogProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (cfi: string) => void;
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

  const handleResultClick = (cfi: string) => {
    onResultClick(cfi);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Search
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Enter search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            size="icon"
            className="shrink-0"
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
                    onClick={() => handleResultClick(result.cfi)}
                    className="w-full text-left px-4 py-3 hover:bg-accent rounded-md transition-colors flex flex-col gap-1"
                  >
                    <span className="text-sm font-bold">
                      {result.chapterTitle || `Chapter ${Math.floor(index / 5) + 1}`}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Page {index + 1}
                      </span>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.excerpt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {results.length} matches found
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;