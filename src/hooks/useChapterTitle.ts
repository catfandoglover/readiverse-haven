import { useState, useEffect } from "react";
import type { Book } from "epubjs";

export const useChapterTitle = (book: Book | null, currentLocation: string | null, pageInfo: any) => {
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("Unknown Chapter");

  useEffect(() => {
    let isSubscribed = true;

    const handleChapterTitleChange = (event: CustomEvent<{ title: string }>) => {
      if (!isSubscribed) return;
      
      if (event.detail.title) {
        const newTitle = event.detail.title.trim();
        if (newTitle && newTitle !== "Unknown Chapter") {
          setCurrentChapterTitle(newTitle);
          
          if (currentLocation) {
            const bookmarkKey = `book-progress-${currentLocation}`;
            const existingBookmark = localStorage.getItem(bookmarkKey);
            if (existingBookmark) {
              try {
                let bookmarkData = JSON.parse(existingBookmark);
                const spineItem = book?.spine?.get(currentLocation);
                const updatedBookmarkData = {
                  ...bookmarkData,
                  chapterInfo: spineItem?.index !== undefined 
                    ? `Chapter ${spineItem.index + 1}: ${newTitle}`
                    : newTitle,
                  pageInfo: `Page ${pageInfo.chapterCurrent} of ${pageInfo.chapterTotal}`,
                  metadata: {
                    ...(bookmarkData.metadata || {}),
                    chapterTitle: newTitle,
                    chapterIndex: spineItem?.index,
                    pageNumber: pageInfo.chapterCurrent,
                    totalPages: pageInfo.chapterTotal,
                  }
                };

                if (isSubscribed) {
                  localStorage.setItem(bookmarkKey, JSON.stringify(updatedBookmarkData));
                  window.dispatchEvent(new Event('storage'));
                }
              } catch (error) {
                console.error('Error updating bookmark metadata:', error);
              }
            }
          }
        }
      }
    };

    window.addEventListener('chapterTitleChange', handleChapterTitleChange as EventListener);
    return () => {
      isSubscribed = false;
      window.removeEventListener('chapterTitleChange', handleChapterTitleChange as EventListener);
    };
  }, [currentLocation, book, pageInfo]);

  return currentChapterTitle;
};