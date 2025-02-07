import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Highlighter, Trash2 } from "lucide-react";
import { Highlight, HighlightColor } from '@/types/highlight';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface HighlightsMenuProps {
  highlights?: Highlight[];
  selectedColor?: HighlightColor;
  onColorSelect?: (color: HighlightColor) => void;
  onHighlightSelect?: (cfiRange: string) => void;
  onRemoveHighlight?: (id: string) => void;
}

const colorClasses: Record<HighlightColor, string> = {
  yellow: 'bg-[#CCFF33]'
};

const HighlightsMenu = ({
  highlights = [],
  selectedColor = 'yellow',
  onColorSelect = () => {},
  onHighlightSelect = () => {},
  onRemoveHighlight = () => {}
}: HighlightsMenuProps) => {
  const highlightCount = highlights.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Highlighter className="h-[1.2rem] w-[1.2rem]" />
          {highlightCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
            >
              {highlightCount}
            </Badge>
          )}
          <span className="sr-only">Toggle highlights menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="sticky top-0 bg-background z-10">
          <div className="p-2 flex gap-2 justify-center">
            <Button
              key="yellow"
              variant="outline"
              size="icon"
              className={`h-6 w-6 rounded-full ${colorClasses.yellow} ${
                selectedColor === 'yellow' ? 'ring-2 ring-offset-2 ring-primary' : ''
              }`}
              onClick={() => onColorSelect('yellow')}
            />
          </div>
          <DropdownMenuSeparator />
        </div>
        
        <ScrollArea className="h-[300px] overflow-y-auto">
          {highlights.length === 0 ? (
            <div className="py-2 px-4 text-sm text-muted-foreground text-center">
              No highlights yet
            </div>
          ) : (
            highlights.map((highlight) => (
              <DropdownMenuItem
                key={highlight.id}
                className="flex items-start gap-2 p-2"
              >
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${colorClasses[highlight.color]}`} />
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-sm line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => onHighlightSelect(highlight.cfiRange)}
                  >
                    {highlight.text}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(highlight.createdAt, 'PP')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onRemoveHighlight(highlight.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HighlightsMenu;
