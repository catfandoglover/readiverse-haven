import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Highlight } from "@/types/highlight";
import type { Note as NoteType } from "@/hooks/useNotes";

// Rename our interface to avoid conflicts
interface HighlightsListProps {
  highlights: Highlight[];
  notes?: NoteType[]; // Use the imported Note type
  currentLocation: string | null;
  onHighlightSelect: (location: string) => void;
  onRemoveHighlight: (id: string) => void;
  onRemoveNote?: (id: string) => void;
  bookKey: string | null;
}

const HighlightsList: React.FC<HighlightsListProps> = ({
  highlights,
  notes = [],
  currentLocation,
  onHighlightSelect,
  onRemoveHighlight,
  onRemoveNote,
  bookKey,
}) => {
  const { toast } = useToast();

  // Filter highlights for the current book
  const bookHighlights = highlights.filter((highlight) => highlight.bookKey === bookKey);
  
  // Filter notes for the current book
  const bookNotes = notes.filter((note) => note.bookKey === bookKey);
  
  // Combine highlights and notes into a single array
  const allItems = [
    ...bookHighlights.map(highlight => ({
      ...highlight,
      type: 'highlight' as const,
      displayText: highlight.text,
    })),
    ...bookNotes.map(note => ({
      ...note,
      type: 'note' as const,
      displayText: note.text, // The highlighted text
      noteContent: note.noteText, // The note content - use noteText from our Note type
    }))
  ];
  
  // Sort all items by creation time (newest first)
  const sortedItems = [...allItems].sort((a, b) => b.createdAt - a.createdAt);

  const handleDeleteItem = (id: string, type: 'highlight' | 'note') => {
    if (type === 'highlight') {
      onRemoveHighlight(id);
      toast({
        description: "Highlight removed",
      });
    } else if (type === 'note' && onRemoveNote) {
      onRemoveNote(id);
      toast({
        description: "Note removed",
      });
    }
  };

  return (
    <div className="w-full">
      <ScrollArea className="h-[65vh]">
        {sortedItems.length === 0 ? (
          <div className="text-center text-white/50 p-4">
            No highlights or notes yet
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#332E38] rounded-2xl p-4 relative group"
              >
                <button
                  onClick={() => handleDeleteItem(item.id, item.type)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 h-8 w-8 flex items-center justify-center bg-[#221F26]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${item.type}`}
                >
                  <Trash2 className="h-4 w-4 text-white/70" />
                </button>
                
                <div 
                  className="cursor-pointer pr-8"
                  onClick={() => onHighlightSelect(item.cfiRange)}
                >
                  {/* Display the highlighted text */}
                  <div className="text-sm font-medium line-clamp-2">
                    {item.displayText}
                  </div>
                  
                  {/* For notes, also display the note content */}
                  {item.type === 'note' && (
                    <div className="mt-2 text-sm italic text-white/80 bg-[#2A2731] p-2 rounded-lg">
                      {item.noteContent}
                    </div>
                  )}
                  
                  {/* Creation date */}
                  <div className="text-xs text-white/70 mt-1">
                    {format(item.createdAt, 'PPpp')}
                  </div>
                  
                  {/* Type label */}
                  <div className="mt-2">
                    <span 
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.type === 'highlight' 
                          ? 'bg-[#CCFF33] text-[#221F26]' 
                          : 'bg-[#8B5CF6] text-white'
                      }`}
                    >
                      {item.type === 'highlight' ? 'Highlight' : 'Note'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default HighlightsList; 