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
import { Highlighter, Trash2, PencilLine } from "lucide-react";
import { Highlight, HighlightColor } from '@/types/highlight';
import { format } from 'date-fns';
import NoteDialog from './NoteDialog';

interface HighlightsMenuProps {
  highlights: Highlight[];
  selectedColor: HighlightColor;
  onColorSelect: (color: HighlightColor) => void;
  onHighlightSelect: (cfiRange: string) => void;
  onRemoveHighlight: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const colorClasses: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-200'
};

const HighlightsMenu = ({
  highlights,
  selectedColor,
  onColorSelect,
  onHighlightSelect,
  onRemoveHighlight,
  onUpdateNote
}: HighlightsMenuProps) => {
  const [selectedHighlight, setSelectedHighlight] = React.useState<Highlight | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);

  const handleNoteClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setNoteDialogOpen(true);
  };

  return (
    <>
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
          align="center" 
          side="left" 
          sideOffset={16}
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
                  className="flex flex-col gap-2 p-2"
                >
                  <div className="flex items-start gap-2 w-full">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${colorClasses.yellow}`} />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-sm line-clamp-2 cursor-pointer hover:text-primary"
                        onClick={() => onHighlightSelect(highlight.cfiRange)}
                      >
                        {highlight.text}
                      </div>
                      {highlight.note && (
                        <div className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                          {highlight.note}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(highlight.createdAt, 'PP')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleNoteClick(highlight)}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => onRemoveHighlight(highlight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedHighlight && (
        <NoteDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          onSave={(note) => {
            onUpdateNote(selectedHighlight.id, note);
            setSelectedHighlight(null);
          }}
          initialNote={selectedHighlight.note}
          highlightedText={selectedHighlight.text}
        />
      )}
    </>
  );
};

export default HighlightsMenu;