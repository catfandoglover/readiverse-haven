import { useEffect } from 'react';
import type { Book } from 'epubjs';

export const useLocationPersistence = (book: Book | null, currentLocation: string | null) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (book && currentLocation) {
        localStorage.setItem(`reading-progress-${book.key()}`, currentLocation);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [book, currentLocation]);
};