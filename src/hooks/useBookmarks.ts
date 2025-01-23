import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const useBookmarks = (
  book: any,
  currentLocation: string | null,
  currentChapterTitle: string
) => {
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const { toast } = useToast();

  const handleBookmarkClick = async () => {
    if (!currentLocation || !book?.rendition) return;

    const bookmarkKey = `book-progress-${currentLocation}`;
    const existingBookmark = localStorage.getItem(bookmarkKey);

    if (existingBookmark) {
      setShowBookmarkDialog(true);
    } else {
      try {
        // Wait for the current location to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));

        const spineItem = book?.spine?.get(currentLocation);
        const chapterInfo = spineItem?.index !== undefined 
          ? `Chapter ${spineItem.index + 1}: ${currentChapterTitle}`
          : currentChapterTitle;

        // Get the current page information from rendition
        const currentPage = book.rendition.currentLocation();
        const pageInfo = currentPage?.start?.displayed || { page: 1, total: 1 };

        const now = new Date();
        
        const bookmarkData = {
          cfi: currentLocation,
          timestamp: now.getTime(),
          chapterInfo,
          pageInfo: `Page ${pageInfo.page} of ${pageInfo.total}`,
          metadata: {
            created: now.toISOString(),
            formattedDate: format(now, 'PPpp'),
            chapterIndex: spineItem?.index,
            chapterTitle: currentChapterTitle,
            pageNumber: pageInfo.page,
            totalPages: pageInfo.total,
            // Store the exact location for precise navigation
            exactLocation: currentPage?.start?.cfi || currentLocation
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

  const handleRemoveBookmark = () => {
    if (currentLocation) {
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
    }
    setShowBookmarkDialog(false);
  };

  return {
    showBookmarkDialog,
    setShowBookmarkDialog,
    handleBookmarkClick,
    handleRemoveBookmark
  };
};