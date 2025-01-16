import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Highlighter, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Highlight, HighlightColor } from '@/types/highlight';

interface HighlightsMenuProps {
  highlights: Highlight[];
  onHighlightSelect: (cfi: string) => void;
  onRemoveHighlight: (id: string) => void;
  currentColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
}

const colorOptions: { value: HighlightColor; label: string }[] = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'pink', label: 'Pink' },
];

const HighlightsMenu = ({
  highlights,
  onHighlightSelect,
  onRemoveHighlight,
  currentColor,
  onColorChange,
}: HighlightsMenuProps) => {
  return (
    <div className="flex flex-col items-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Highlighter className="h-[1.2rem] w-[1.2rem]" />
            {highlights.length > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
              >
                {highlights.length}
              </Badge>
            )}
            <span className="sr-only">Toggle highlights menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          <DropdownMenuLabel>Highlight Colors</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-2 grid grid-cols-4 gap-2">
            {colorOptions.map(({ value, label }) => (
              <Button
                key={value}
                variant={currentColor === value ? "secondary" : "ghost"}
                className="h-8 w-full"
                style={{ backgroundColor: value === currentColor ? value : undefined }}
                onClick={() => onColorChange(value)}
              >
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Highlights</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {highlights
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((highlight) => (
              <DropdownMenuItem
                key={highlight.id}
                className="flex flex-col items-start gap-1 p-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span 
                    className="text-sm line-clamp-2"
                    style={{ backgroundColor: highlight.color }}
                  >
                    {highlight.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHighlight(highlight.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {highlight.chapterInfo && (
                  <span className="text-xs text-muted-foreground">
                    {highlight.chapterInfo}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(highlight.createdAt, 'PPpp')}
                </span>
              </DropdownMenuItem>
            ))}
          {highlights.length === 0 && (
            <DropdownMenuItem disabled>No highlights yet</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HighlightsMenu;