import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface BookmarksMenuProps {
  currentLocation: string | null;
  onLocationSelect: (location: string) => void;
}

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

const BookmarksMenu = ({ currentLocation, onLocationSelect }: BookmarksMenuProps) => {
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkData>>({});

  useEffect(() => {
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
            // If parsing fails, use the raw value as CFI
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
    window.addEventListener('storage', loadBookmarks);
    return () => {
      window.removeEventListener('storage', loadBookmarks);
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bookmark className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle bookmarks menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Bookmarks</DropdownMenuLabel>
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
  );
};

export default BookmarksMenu;