import { useToast } from "@/components/ui/use-toast";
import ePub from "epubjs";
import { Book } from "epubjs";

export const useFileHandler = (
  setBook: (book: Book) => void,
  setCurrentLocation: (location: string) => void,
  loadProgress: () => string | null,
  setPageInfo: (fn: (prev: any) => any) => void
) => {
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const bookData = e.target?.result;
      const newBook = ePub(bookData);
      setBook(newBook);

      try {
        // Generate locations for the book
        await newBook.locations.generate(1024);
        
        // Get the saved reading position
        const savedLocation = loadProgress();
        
        if (savedLocation) {
          // Set the current location to the saved position
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