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
  const [bookmarks, setBookmarks] = React.useState<{ [key: string]: string }>({});
  const { toast } = useToast();

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
              Object.entries(bookmarks).map(([key, cfi]) => (
                <Button
                  key={key}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => onBookmarkSelect(cfi)}
                >
                  <BookmarkIcon className="h-4 w-4 mr-2 text-red-500" />
                  <span className="truncate">
                    Bookmark {new Date(parseInt(key.split('-')[2])).toLocaleDateString()}
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