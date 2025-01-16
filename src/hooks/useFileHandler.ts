import { Book } from "epubjs";
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
      const bookData = e.target?.result;
      const newBook = new (window as any).ePub(bookData);
      setBook(newBook);

      try {
        // Generate locations for the book
        await newBook.locations.generate(1024);
        
        // Get the saved reading position for this book
        const savedLocation = localStorage.getItem(`reading-progress-${newBook.key()}`);
        
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