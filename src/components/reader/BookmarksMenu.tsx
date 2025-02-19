import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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

interface BookmarksMenuProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  onBookmarkClick: () => void;
  bookKey: string | null;
}

const BookmarksMenu = ({ 
  currentLocation, 
  onLocationSelect, 
  onBookmarkClick,
  bookKey 
}: BookmarksMenuProps) => {
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkData>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  // Single effect to handle both bookmark loading and status
  useEffect(() => {
    if (!bookKey) {
      setBookmarks({});
      setIsBookmarked(false);
      return;
    }

    const loadBookmarksAndStatus = () => {
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

      // Check if current location is bookmarked
      if (currentLocation) {
        const bookmarkKey = `book-progress-${currentLocation}`;
        const bookmarkData = localStorage.getItem(bookmarkKey);
        if (bookmarkData) {
          try {
            const data = JSON.parse(bookmarkData);
            // Only consider it bookmarked if it belongs to the current book
            setIsBookmarked(data.bookKey === bookKey);
          } catch {
            setIsBookmarked(false);
          }
        } else {
          setIsBookmarked(false);
        }
      } else {
        setIsBookmarked(false);
      }
    };

    // Initial load
    loadBookmarksAndStatus();

    // Poll for changes every second (for mobile compatibility)
    const pollInterval = setInterval(loadBookmarksAndStatus, 1000);

    // Also listen for storage events (works better on desktop)
    const handleStorage = () => {
      loadBookmarksAndStatus();
    };

    window.addEventListener('storage', handleStorage);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookKey, currentLocation]);

  const handleClearAll = () => {
    if (!bookKey) return;
    
    // Only clear bookmarks for the current book
    Object.entries(bookmarks).forEach(([key, bookmark]) => {
      if (bookmark.bookKey === bookKey) {
        localStorage.removeItem(key);
      }
    });
    
    setBookmarks({});
    setIsBookmarked(false);
    
    // Manually trigger a storage event for mobile
    window.dispatchEvent(new Event('storage'));
    
    toast({
      description: "All bookmarks have been cleared",
    });
  };

  const bookmarkCount = Object.values(bookmarks).filter(b => b.bookKey === bookKey).length;

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBookmarkClick}
        className="text-red-500 hover:text-red-600"
      >
        <Bookmark 
          className="h-[1.2rem] w-[1.2rem]" 
          fill={isBookmarked ? "currentColor" : "none"} 
          stroke={isBookmarked ? "currentColor" : "currentColor"}
        />
        <span className="sr-only">Bookmark this page</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bookmark className="h-[1.2rem] w-[1.2rem]" />
            {bookmarkCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
              >
                {bookmarkCount}
              </Badge>
            )}
            <span className="sr-only">Toggle bookmarks menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            Bookmarks
            {bookmarkCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-6 w-6"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear all bookmarks</span>
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(bookmarks)
            .filter(([, bookmark]) => bookmark.bookKey === bookKey)
            .sort(([, a], [, b]) => b.timestamp - a.timestamp)
            .map(([key, bookmark]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => onLocationSelect(bookmark.cfi)}
                className="flex flex-col items-start gap-1"
              >
                <span className="text-sm font-medium">{bookmark.chapterInfo}</span>
                <span className="text-xs text-muted-foreground">{bookmark.pageInfo}</span>
                {bookmark.metadata?.created && (
                  <span className="text-xs text-muted-foreground">
                    {bookmark.metadata.formattedDate || format(parseISO(bookmark.metadata.created), 'PPpp')}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          {bookmarkCount === 0 && (
            <DropdownMenuItem disabled>No bookmarks yet</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BookmarksMenu;