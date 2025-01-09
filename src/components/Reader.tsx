import React, { useEffect, useState } from "react";
import ePub from "epubjs";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useToast } from "./ui/use-toast";

const Reader = () => {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [fontSize, setFontSize] = useState(100);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const bookData = e.target?.result;
        const newBook = ePub(bookData);
        setBook(newBook);
      };
      reader.readAsArrayBuffer(file);

      toast({
        title: "Success",
        description: "Book loaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const handleNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    if (rendition) {
      rendition.themes.fontSize(`${newSize}%`);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      }
    };

    window.addEventListener("keyup", handleKeyPress);
    return () => window.removeEventListener("keyup", handleKeyPress);
  }, [rendition]);

  // Set up rendition when book changes and container exists
  useEffect(() => {
    if (!book) return;

    const container = document.querySelector(".epub-view");
    if (!container) return;

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
    });

    setRendition(newRendition);
    newRendition.display();

    return () => {
      if (newRendition) {
        newRendition.destroy();
      }
    };
  }, [book]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="reader-container p-4 max-w-4xl mx-auto">
        {!book ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] border-2 border-dashed border-gray-300 rounded-lg">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload EPUB file</span>
              </div>
              <input
                type="file"
                accept=".epub"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevPage}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextPage}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Font Size</span>
                <Slider
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                  min={50}
                  max={200}
                  step={10}
                  className="w-32"
                />
              </div>
            </div>
            <div className="epub-view h-[80vh] border border-gray-200 rounded-lg overflow-hidden" />
          </>
        )}
      </div>
    </div>
  );
};

export default Reader;