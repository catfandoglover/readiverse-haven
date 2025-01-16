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

interface HighlightsMenuProps {
  highlights?: Highlight[];
  selectedColor?: HighlightColor;
  onColorSelect?: (color: HighlightColor) => void;
  onHighlightSelect?: (cfiRange: string) => void;
  onRemoveHighlight?: (id: string) => void;
}

const HighlightsMenu = ({
  highlights = [],
  selectedColor = 'yellow',
  onColorSelect = () => {},
  onHighlightSelect = () => {},
  onRemoveHighlight = () => {}
}: HighlightsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-sm bg-background/60 backdrop-blur-sm border-0 hover:bg-background/80"
        >
          <Highlighter className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="left" 
        sideOffset={16}
        alignOffset={-40} // This aligns the drawer with the highlighter icon
        className="w-64"
      >
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
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${colorClasses.yellow}`} />
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