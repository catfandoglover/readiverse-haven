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
          <DialogTitle>Search</DialogTitle>
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
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="animate-spin">⌛</div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {results.length > 0 && (
          <ScrollArea className="h-[300px] mt-4 rounded-md border p-4">
            <div className="space-y-4">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.cfi)}
                  className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <p className="text-sm">
                    ...{result.excerpt}...
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;