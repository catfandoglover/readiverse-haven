import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchResult } from '@/types/reader';
import { Button } from '@/components/ui/button';

interface InlineSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
}

const InlineSearch: React.FC<InlineSearchProps> = ({ 
  onSearch, 
  onResultClick 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Clear search results when query is emptied
  useEffect(() => {
    if (!query.trim() && hasSearched) {
      clearSearch();
    }
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Input
            placeholder="Search in book..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#332E38] text-white border-[#CCFF33] focus:border-[#CCFF33] focus:ring-[#CCFF33] focus-visible:ring-[#CCFF33] focus-visible:ring-offset-0 rounded-2xl pr-20 pl-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e);
              }
            }}
          />
          <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/50" />
          </div>
          {(query || hasSearched) && (
            <div 
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={clearSearch}
            >
              <X className="h-4 w-4 text-white/50 hover:text-white/80" />
            </div>
          )}
        </div>
      </form>

      {hasSearched && (
        <div className="mt-4 relative">
          <div className="max-h-[300px] overflow-y-auto border-2 border-[#CCFF33] rounded-2xl p-3">
            {results.length === 0 ? (
              isSearching ? (
                <div className="text-center text-white/70 p-2">
                  Searching...
                </div>
              ) : (
                <div className="text-center text-white/70 p-2">
                  No results found
                </div>
              )
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-[#332E38] hover:bg-[#373763] text-white p-4 rounded-xl cursor-pointer"
                    onClick={() => {
                      onResultClick(result);
                      clearSearch();
                    }}
                  >
                    <div className="text-white/70 text-xs mb-1">
                      {result.chapterTitle}
                    </div>
                    <div 
                      className="text-sm" 
                      dangerouslySetInnerHTML={{
                        __html: result.excerpt.replace(
                          new RegExp(query, 'gi'),
                          (match) => `<span class="bg-[#CCFF33] text-[#221F26] px-1">${match}</span>`
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineSearch; 