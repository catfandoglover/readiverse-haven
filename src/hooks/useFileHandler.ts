// src/hooks/useFileHandler.ts
import { useToast } from "@/hooks/use-toast";
import ePub from "epubjs";
import type { Book } from "epubjs";
export const useFileHandler = (
  setBook: (book: Book) => void,
  setCurrentLocation: (location: string | null) => void,
  loadProgress: () => string | null,
  setPageInfo: (fn: (prev: any) => any) => void
) => {
  const { toast } = useToast();

  const initializeBook = async (bookData: ArrayBuffer) => {
    try {
      console.log('Initializing book with data size:', bookData.byteLength);
      
      const newBook = ePub(bookData);
      console.log('Created ePub instance');
      
      await newBook.ready;
      console.log('Book ready');
      
      await newBook.locations.generate(1024);
      console.log('Locations generated');
      
      setBook(newBook);
      console.log('Book set in state');

      const bookKey = await newBook.key();
      console.log('Book key generated:', bookKey);
      
      const savedLocation = localStorage.getItem(`reading-progress-${bookKey}`);
      console.log('Saved location:', savedLocation);
      
      if (savedLocation) {
        setCurrentLocation(savedLocation);
        toast({
          description: "Restored your last reading position",
        });
      }

      const totalLocations = newBook.locations.length();
      setPageInfo(prev => ({ ...prev, total: totalLocations }));
      console.log('Page info updated, total locations:', totalLocations);

      return newBook;
    } catch (error) {
      console.error('Error initializing book:', error);
      toast({
        variant: "destructive",
        description: "Failed to load book. Please try again.",
      });
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const bookData = e.target?.result as ArrayBuffer;
      if (!bookData) {
        throw new Error("Failed to read book data");
      }
      await initializeBook(bookData);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadBookFromUrl = async (url: string) => {
    if (!url) {
      console.error('No URL provided to loadBookFromUrl');
      return;
    }

    try {
      console.log('Fetching book from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const bookData = await response.arrayBuffer();
      if (!bookData || bookData.byteLength === 0) {
        throw new Error('Received empty book data');
      }
      
      console.log('Book data fetched, size:', bookData.byteLength);
      await initializeBook(bookData);
    } catch (error) {
      console.error('Error loading book from URL:', error);
      toast({
        variant: "destructive",
        description: `Failed to load book: ${error.message}`,
      });
    }
  };

  return { handleFileUpload, loadBookFromUrl };
};
