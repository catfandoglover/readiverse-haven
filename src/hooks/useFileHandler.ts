import { Book } from "epubjs";
import ePub from "epubjs";
import { useToast } from "@/components/ui/use-toast";

export const useFileHandler = (
  setBook: (book: Book) => void,
  setCurrentLocation: (location: string | null) => void,
  loadProgress: () => string | null,
  setPageInfo: (fn: (prev: any) => any) => void
) => {
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bookData = e.target?.result;
        if (!bookData) {
          throw new Error("Failed to read book data");
        }

        const newBook = ePub(bookData);
        await newBook.ready; // Wait for the book to be ready

        // Generate locations for the book
        await newBook.locations.generate(1024);
        
        // Set the book in state
        setBook(newBook);

        // Get the saved reading position for this book
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

    reader.readAsArrayBuffer(file);
  };

  return { handleFileUpload };
};