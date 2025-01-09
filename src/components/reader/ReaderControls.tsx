import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (value: number[]) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  coverUrl?: string;
}

const ReaderControls = ({
  fontSize,
  onFontSizeChange,
  onPrevPage,
  onNextPage,
  coverUrl,
}: ReaderControlsProps) => {
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