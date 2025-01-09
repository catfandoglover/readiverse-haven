import { ChevronLeft, ChevronRight, BookOpen, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  coverUrl?: string;
  textAlign?: 'left' | 'justify' | 'center';
  onTextAlignChange?: (align: 'left' | 'justify' | 'center') => void;
}

const ReaderControls = ({
  fontSize,
  onFontSizeChange,
  onPrevPage,
  onNextPage,
  coverUrl,
  textAlign = 'left',
  onTextAlignChange,
}: ReaderControlsProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        handleFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onPrevPage}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextPage}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {coverUrl && (
          <Button variant="outline" size="icon" asChild>
            <a href={coverUrl} target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
            </a>
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={handleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {textAlign === 'left' && <AlignLeft className="h-4 w-4" />}
              {textAlign === 'center' && <AlignCenter className="h-4 w-4" />}
              {textAlign === 'justify' && <AlignJustify className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onTextAlignChange?.('left')}>
              <AlignLeft className="mr-2 h-4 w-4" />
              Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTextAlignChange?.('center')}>
              <AlignCenter className="mr-2 h-4 w-4" />
              Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTextAlignChange?.('justify')}>
              <AlignJustify className="mr-2 h-4 w-4" />
              Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Font Size</span>
        <Slider
          value={[fontSize]}
          onValueChange={onFontSizeChange}
          min={50}
          max={200}
          step={10}
          className="w-32"
        />
      </div>
    </div>
  );
};

export default ReaderControls;