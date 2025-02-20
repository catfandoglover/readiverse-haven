
import { useEffect } from 'react';
import type { Book } from 'epubjs';

export const useLocationPersistence = (book: Book | null, currentLocation: string | null) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (book && currentLocation) {
        console.log('Saving reading position:', {
          bookKey: book.key(),
          location: currentLocation
        });
        localStorage.setItem(`reading-progress-${book.key()}`, currentLocation);
      }
    };

    // Save position when component unmounts or page unloads
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [book, currentLocation]);
};
