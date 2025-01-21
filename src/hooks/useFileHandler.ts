import { Book } from "epubjs";
import ePub from "epubjs";
import { useToast } from "@/components/ui/use-toast";
import { PDFProcessor } from "@/utils/pdfProcessor";

export const useFileHandler = (
  setBook: (book: Book) => void,
  setCurrentLocation: (location: string | null) => void,
  loadProgress: () => string | null,
  setPageInfo: (fn: (prev: any) => any) => void
) => {
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    const fileType = file.type;
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) {
          throw new Error("Failed to read file data");
        }

        if (fileType === 'application/pdf') {
          const pdfProcessor = new PDFProcessor();
          await pdfProcessor.loadDocument(fileData as ArrayBuffer);
          
          // Create a virtual EPUB from PDF content
          const pages = await pdfProcessor.getAllPages();
          const virtualEpub = await createVirtualEpubFromPDF(pages);
          
          setBook(virtualEpub);
          pdfProcessor.destroy();
          
          toast({
            description: "PDF loaded successfully!",
          });
        } else if (fileType === 'application/epub+zip') {
          const newBook = ePub(fileData);
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
        } else {
          throw new Error("Unsupported file type");
        }
      } catch (error) {
        console.error('Error initializing document:', error);
        toast({
          variant: "destructive",
          description: "Failed to load document. Please try again.",
        });
      }
    };

    if (fileType === 'application/pdf') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return { handleFileUpload };
};

// Helper function to create a virtual EPUB from PDF content
const createVirtualEpubFromPDF = async (pages: { content: string; pageNum: number }[]): Promise<Book> => {
  // Create HTML content from PDF pages
  const htmlContent = pages.map(page => `
    <section class="pdf-page" id="page-${page.pageNum}">
      <div class="pdf-content">
        ${page.content}
      </div>
    </section>
  `).join('');

  // Create a Blob with the HTML content
  const blob = new Blob([`
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Converted PDF</title>
        <style>
          .pdf-page {
            margin: 2em 0;
            padding: 1em;
            border-bottom: 1px solid #eee;
          }
          .pdf-content {
            font-family: serif;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `], { type: 'application/xhtml+xml' });

  // Create a virtual EPUB book from the Blob URL
  const book = ePub(URL.createObjectURL(blob));
  await book.ready;
  return book;
};