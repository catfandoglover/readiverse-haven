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

      await newBook.locations.generate(1024);
      const totalLocations = newBook.locations.length();
      setPageInfo(prev => ({ ...prev, total: totalLocations }));

      const savedCfi = await loadProgress();
      if (savedCfi) {
        setCurrentLocation(savedCfi);
        toast({
          title: "Progress Restored",
          description: "Returning to your last reading position",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return { handleFileUpload };
};