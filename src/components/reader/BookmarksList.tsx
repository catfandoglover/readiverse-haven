import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface BookmarkData {
  cfi: string;
  timestamp: number;
  chapterInfo: string;
  pageInfo: string;
  bookKey: string;
  metadata?: {
    created?: string;
    formattedDate?: string;
    chapterTitle?: string;
    chapterIndex?: number;
    pageNumber?: number;
    totalPages?: number;
    exactLocation?: string;
  };
}

interface BookmarksListProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  bookKey: string | null;
}

const BookmarksList = forwardRef<any, BookmarksListProps>(({ 
  currentLocation, 
  onLocationSelect, 
  bookKey 
}, ref) => {
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkData>>({});
  const { toast } = useToast();

  // Load bookmarks and monitor for changes
  useEffect(() => {
    if (!bookKey) {
      setBookmarks({});
      return;
    }

    const loadBookmarks = () => {
      console.log('Loading bookmarks for book:', bookKey);
      const marks: Record<string, BookmarkData> = {};
      
      // Load all bookmarks for current book
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('book-progress-')) continue;

        try {
          const value = localStorage.getItem(key);
          if (!value) continue;

          const data = JSON.parse(value);
          // Only include bookmarks for the current book
          if (data.bookKey === bookKey) {
            marks[key] = {
              cfi: data.metadata?.exactLocation || data.cfi,
              timestamp: data.timestamp || Date.now(),
              chapterInfo: data.chapterInfo || `Chapter ${data.metadata?.chapterIndex + 1}: ${data.metadata?.chapterTitle}`,
              pageInfo: data.pageInfo || `Page ${data.metadata?.pageNumber} of ${data.metadata?.totalPages}`,
              bookKey: data.bookKey,
              metadata: data.metadata || {}
            };
          }
        } catch (error) {
          console.warn('Invalid bookmark data:', key, error);
        }
      }

      // Update bookmarks state
      setBookmarks(marks);
    };

    // Initial load
    loadBookmarks();

    // Poll for changes every second (for mobile compatibility)
    const pollInterval = setInterval(loadBookmarks, 1000);

    // Also listen for storage events (works better on desktop)
    const handleStorage = () => {
      loadBookmarks();
    };

    window.addEventListener('storage', handleStorage);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookKey]);

  const handleClearAll = () => {
    if (!bookKey) return;
    
    // Only clear bookmarks for the current book
    Object.entries(bookmarks).forEach(([key, bookmark]) => {
      if (bookmark.bookKey === bookKey) {
        localStorage.removeItem(key);
      }
    });
    
    setBookmarks({});
    
    // Manually trigger a storage event for mobile
    window.dispatchEvent(new Event('storage'));
    
    toast({
      description: "All bookmarks have been cleared",
    });
  };

  const handleDeleteBookmark = (key: string) => {
    localStorage.removeItem(key);
    
    // Remove from state
    const newBookmarks = { ...bookmarks };
    delete newBookmarks[key];
    setBookmarks(newBookmarks);
    
    // Manually trigger a storage event for mobile
    window.dispatchEvent(new Event('storage'));
    
    toast({
      description: "Bookmark removed",
    });
  };

  // Expose the clearAll method to parent components
  useImperativeHandle(ref, () => ({
    __clearAll: handleClearAll
  }));

  const bookmarkCount = Object.values(bookmarks).filter(b => b.bookKey === bookKey).length;
  const sortedBookmarks = Object.entries(bookmarks)
    .filter(([, bookmark]) => bookmark.bookKey === bookKey)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp);

  return (
    <div className="w-full" data-bookmarks-list>
      <ScrollArea className="h-[65vh]">
        {bookmarkCount === 0 ? (
          <div className="text-center text-white/50 p-4">
            No bookmarks yet
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookmarks.map(([key, bookmark]) => (
              <div
                key={key}
                className="bg-[#332E38] rounded-2xl p-4 relative group"
              >
                <button
                  onClick={() => handleDeleteBookmark(key)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 h-8 w-8 flex items-center justify-center bg-[#221F26]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete bookmark"
                >
                  <Trash2 className="h-4 w-4 text-white/70" />
                </button>
                
                <div 
                  className="cursor-pointer pr-8"
                  onClick={() => onLocationSelect(bookmark.cfi)}
                >
                  <div className="text-sm font-medium">{bookmark.chapterInfo}</div>
                  <div className="text-xs text-white/70 mt-1">{bookmark.pageInfo}</div>
                  {bookmark.metadata?.created && (
                    <div className="text-xs text-white/50 mt-1">
                      {bookmark.metadata.formattedDate || format(parseISO(bookmark.metadata.created), 'PPpp')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
});

BookmarksList.displayName = "BookmarksList";

export default BookmarksList; 