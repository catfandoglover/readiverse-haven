import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import type { Book } from "epubjs";

export const useBookmarks = (book: Book | null, currentLocation: string | null, currentChapterTitle: string, pageInfo: any) => {
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const { toast } = useToast();

  const handleBookmarkClick = async () => {
    if (!currentLocation) return;

    const bookmarkKey = `book-progress-${currentLocation}`;
    const existingBookmark = localStorage.getItem(bookmarkKey);

    if (existingBookmark) {
      setShowBookmarkDialog(true);
    } else {
      try {
        const spineItem = book?.spine?.get(currentLocation);
        const chapterInfo = spineItem?.index !== undefined 
          ? `Chapter ${spineItem.index + 1}: ${currentChapterTitle}`
          : currentChapterTitle;

        const now = new Date();
        
        const bookmarkData = {
          cfi: currentLocation,
          timestamp: now.getTime(),
          chapterInfo,
          pageInfo: `Page ${pageInfo.chapterCurrent} of ${pageInfo.chapterTotal}`,
          metadata: {
            created: now.toISOString(),
            formattedDate: format(now, 'PPpp'),
            chapterIndex: spineItem?.index,
            chapterTitle: currentChapterTitle,
            pageNumber: pageInfo.chapterCurrent,
            totalPages: pageInfo.chapterTotal,
          }
        };

        localStorage.setItem(bookmarkKey, JSON.stringify(bookmarkData));
        window.dispatchEvent(new Event('storage'));
        
        toast({
          description: `Bookmark added: ${chapterInfo} (${format(now, 'PP')})`,
        });
      } catch (error) {
        console.error('Error saving bookmark:', error);
        toast({
          variant: "destructive",
          description: "Failed to save bookmark. Please try again.",
        });
      }
    }
  };

  const removeBookmark = () => {
    if (!currentLocation) return;
    
    const bookmarkKey = `book-progress-${currentLocation}`;
    try {
      localStorage.removeItem(bookmarkKey);
      window.dispatchEvent(new Event('storage'));
      toast({
        description: "Bookmark removed successfully",
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        variant: "destructive",
        description: "Failed to remove bookmark. Please try again.",
      });
    }
    setShowBookmarkDialog(false);
  };

  return {
    showBookmarkDialog,
    setShowBookmarkDialog,
    handleBookmarkClick,
    removeBookmark
  };
};