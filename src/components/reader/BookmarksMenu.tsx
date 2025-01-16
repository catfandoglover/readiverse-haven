import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface BookmarksMenuProps {
  onBookmarkSelect: (cfi: string) => void;
}

const BookmarksMenu = ({ onBookmarkSelect }: BookmarksMenuProps) => {
  const [bookmarks, setBookmarks] = React.useState<{ [key: string]: { cfi: string, timestamp: number, chapterInfo?: string, pageInfo?: string } }>({});
  const { toast } = useToast();

  React.useEffect(() => {
    const loadBookmarks = () => {
      const marks: { [key: string]: { cfi: string, timestamp: number, chapterInfo?: string, pageInfo?: string } } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('book-progress-')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const data = JSON.parse(value);
              marks[key] = {
                cfi: data.cfi || value,
                timestamp: data.timestamp || Date.now(),
                chapterInfo: data.chapterInfo || "Unknown Chapter",
                pageInfo: data.pageInfo || "Page Unknown"
              };
            } catch {
              // If parsing fails, use the old format
              marks[key] = {
                cfi: value,
                timestamp: Date.now(),
                chapterInfo: "Unknown Chapter",
                pageInfo: "Page Unknown"
              };
            }
          }
        }
      }
      setBookmarks(marks);
    };

    loadBookmarks();
    window.addEventListener('storage', loadBookmarks);
    return () => window.removeEventListener('storage', loadBookmarks);
  }, []);

  const clearAllBookmarks = () => {
    Object.keys(bookmarks).forEach(key => {
      localStorage.removeItem(key);
    });
    setBookmarks({});
    window.dispatchEvent(new Event('storage'));
    toast({
      description: "All bookmarks have been cleared",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <BookmarkIcon className="h-5 w-5" />
          {Object.keys(bookmarks).length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {Object.keys(bookmarks).length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Bookmarks</SheetTitle>
            {Object.keys(bookmarks).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllBookmarks}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-4">
            {Object.entries(bookmarks).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bookmarks yet
              </p>
            ) : (
              Object.entries(bookmarks).map(([key, { cfi, timestamp, chapterInfo, pageInfo }]) => (
                <Button
                  key={key}
                  variant="ghost"
                  className="w-full justify-start text-left flex-col items-start"
                  onClick={() => onBookmarkSelect(cfi)}
                >
                  <div className="flex items-center w-full">
                    <BookmarkIcon className="h-4 w-4 mr-2 text-red-500 shrink-0" />
                    <span className="truncate">
                      {chapterInfo}, {pageInfo}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {new Date(timestamp).toLocaleDateString()}
                  </span>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default BookmarksMenu;