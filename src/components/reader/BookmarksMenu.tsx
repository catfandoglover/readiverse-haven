import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface BookmarksMenuProps {
  onBookmarkSelect: (cfi: string) => void;
}

const BookmarksMenu = ({ onBookmarkSelect }: BookmarksMenuProps) => {
  const [bookmarks, setBookmarks] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    const loadBookmarks = () => {
      const marks: { [key: string]: string } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('book-progress-')) {
          const value = localStorage.getItem(key);
          if (value) {
            marks[key] = value;
          }
        }
      }
      setBookmarks(marks);
    };

    loadBookmarks();
    window.addEventListener('storage', loadBookmarks);
    return () => window.removeEventListener('storage', loadBookmarks);
  }, []);

  const getBookmarkInfo = (key: string) => {
    const timestamp = parseInt(key.split('-')[2]);
    const date = new Date(timestamp);
    return {
      date: format(date, 'MMM d, yyyy h:mm a'),
      chapter: localStorage.getItem(`chapter-${key}`) || 'Unknown Chapter',
      page: localStorage.getItem(`page-${key}`) || 'Unknown Page'
    };
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
          <SheetTitle>Bookmarks</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-4">
            {Object.entries(bookmarks).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bookmarks yet
              </p>
            ) : (
              Object.entries(bookmarks).map(([key, cfi]) => {
                const info = getBookmarkInfo(key);
                return (
                  <Button
                    key={key}
                    variant="ghost"
                    className="w-full justify-start text-left flex-col items-start"
                    onClick={() => onBookmarkSelect(cfi)}
                  >
                    <div className="flex items-center w-full">
                      <BookmarkIcon className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">
                          {info.chapter}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Page {info.page} • {info.date}
                        </span>
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default BookmarksMenu;