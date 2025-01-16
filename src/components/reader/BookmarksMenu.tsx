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
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface BookmarkData {
  cfi: string;
  timestamp: number;
  chapterInfo: string;
  pageInfo: string;
  metadata?: {
    chapterTitle?: string;
    chapterIndex?: number;
    pageNumber?: number;
    totalPages?: number;
  };
}

interface BookmarksMenuProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
  onBookmarkClick: () => void;
}

const BookmarksMenu = ({ currentLocation, onLocationSelect, onBookmarkClick }: BookmarksMenuProps) => {
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkData>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkBookmark = () => {
      if (currentLocation) {
        const bookmarkExists = localStorage.getItem(`book-progress-${currentLocation}`) !== null;
        setIsBookmarked(bookmarkExists);
      }
    };

    const loadBookmarks = () => {
      const marks: Record<string, BookmarkData> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('book-progress-')) {
          const value = localStorage.getItem(key);
          if (!value) continue;

          try {
            const data = JSON.parse(value);
            marks[key] = {
              cfi: data.cfi || value,
              timestamp: data.timestamp || Date.now(),
              chapterInfo: data.chapterInfo || `Chapter ${data.metadata?.chapterIndex + 1}: ${data.metadata?.chapterTitle}`,
              pageInfo: `Page ${data.metadata?.pageNumber}`,
              metadata: data.metadata || {}
            };
          } catch {
            marks[key] = {
              cfi: value,
              timestamp: Date.now(),
              chapterInfo: "Unknown Chapter",
              pageInfo: "Page information unavailable"
            };
          }
        }
      }
      setBookmarks(marks);
    };

    loadBookmarks();
    checkBookmark();
    window.addEventListener('storage', loadBookmarks);
    window.addEventListener('storage', checkBookmark);
    return () => {
      window.removeEventListener('storage', loadBookmarks);
      window.removeEventListener('storage', checkBookmark);
    };
  }, [currentLocation]);

  const handleClearAll = () => {
    const bookmarkKeys = Object.keys(bookmarks);
    bookmarkKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    setBookmarks({});
    window.dispatchEvent(new Event('storage'));
    toast({
      description: "All bookmarks have been cleared",
    });
  };

  return (
    <div className="flex flex-col md:items-end gap-2">
      <div className="flex items-center gap-2">
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
              {Object.keys(bookmarks).length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
                >
                  {Object.keys(bookmarks).length}
                </Badge>
              )}
              <span className="sr-only">Toggle bookmarks menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              Bookmarks
              {Object.keys(bookmarks).length > 0 && (
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
              .sort(([, a], [, b]) => b.timestamp - a.timestamp)
              .map(([key, bookmark]) => (
                <DropdownMenuItem
                  key={key}
                  onSelect={() => onLocationSelect(bookmark.cfi)}
                  className="flex flex-col items-start"
                >
                  <span className="text-sm">{bookmark.chapterInfo}</span>
                  <span className="text-xs text-muted-foreground">{bookmark.pageInfo}</span>
                </DropdownMenuItem>
              ))}
            {Object.keys(bookmarks).length === 0 && (
              <DropdownMenuItem disabled>No bookmarks yet</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BookmarksMenu;