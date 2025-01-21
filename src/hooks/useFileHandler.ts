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
      const newBook = ePub(bookData);
      await newBook.ready;
      await newBook.locations.generate(1024);
      
      setBook(newBook);

      const bookKey = await newBook.key();
      const savedLocation = localStorage.getItem(`reading-progress-${bookKey}`);
      
      if (savedLocation) {
        setCurrentLocation(savedLocation);
        toast({
          description: "Restored your last reading position",
        });
      }

      const totalLocations = newBook.locations.length();
      setPageInfo(prev => ({ ...prev, total: totalLocations }));
    } catch (error) {
      console.error('Error initializing book:', error);
      toast({
        variant: "destructive",
        description: "Failed to load book. Please try again.",
      });
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
