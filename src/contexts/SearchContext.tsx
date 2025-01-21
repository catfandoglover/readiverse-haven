import React, { createContext, useContext, useCallback } from 'react';
import type { Book } from "epubjs";
import type Spine from "epubjs/types/spine";

interface SpineItem {
  href: string;
  cfiBase: string;
}

interface SearchResult {
  cfi: string;
  excerpt: string;
}

interface SearchContextType {
  handleSearch: (query: string) => Promise<SearchResult[]>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ book: Book | null; children: React.ReactNode }> = ({ 
  book,
  children 
}) => {
  const handleSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    console.log('Starting search for query:', query);
    if (!book) {
      console.log('Book not available');
      return [];
    }

    const results: SearchResult[] = [];
    
    try {
      // Get spine items
      const spine = book.spine as Spine;
      if (!spine) {
        console.error('No spine found');
        return [];
      }

      // Safely access spine items with type assertion
      const spineItems = (spine as unknown as { items: SpineItem[] }).items;
      if (!spineItems || !spineItems.length) {
        console.error('No spine items found');
        return [];
      }

      console.log('Found spine items:', spineItems.length);
      
      // Search through each spine item
      for (const item of spineItems) {
        try {
          console.log('Processing spine item:', item.href);
          // Get the document content
          const content = await book.load(item.href);
          console.log('Loaded content:', {
            type: typeof content,
            isNull: content === null,
            hasDocument: content && (content as any).documentElement !== undefined
          });
          
          if (!content || typeof content !== 'object') {
            console.log('Invalid content for:', item.href);
            continue;
          }

          const doc = content as any;
          if (!doc.documentElement) {
            console.log('No document element found for:', item.href);
            continue;
          }

          // Convert content to text and search
          const textContent = doc.documentElement.textContent || '';
          console.log('Text content sample:', textContent.substring(0, 100));
          const text = textContent.toLowerCase();
          const searchQuery = query.toLowerCase();
          
          let lastIndex = 0;
          while (true) {
            const index = text.indexOf(searchQuery, lastIndex);
            if (index === -1) break;

            console.log('Found match:', {
              index,
              excerpt: text.slice(Math.max(0, index - 20), Math.min(text.length, index + query.length + 20))
            });

            // Get surrounding context
            const start = Math.max(0, index - 40);
            const end = Math.min(text.length, index + query.length + 40);
            const excerpt = text.slice(start, end);

            try {
              // Generate CFI for this location
              const cfi = item.cfiBase + "!" + index;
              console.log('Generated CFI:', cfi);
              
              results.push({ 
                cfi, 
                excerpt: `...${excerpt}...` 
              });
              
              console.log('Added result:', {
                cfi,
                excerptLength: excerpt.length
              });
            } catch (error) {
              console.error('Error generating CFI:', error);
            }
            
            lastIndex = index + 1;
          }
        } catch (error) {
          console.error('Error processing section:', error);
        }
      }

      console.log('Search completed. Total results:', results.length);
      return results;
    } catch (error) {
      console.error('Error accessing spine items:', error);
      return [];
    }
  }, [book]);

  return (
    <SearchContext.Provider value={{ handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};