import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: string) => void;
  initialNote?: string;
  highlightedText: string;
}

const NoteDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  initialNote = "", 
  highlightedText 
}: NoteDialogProps) => {
  const [note, setNote] = React.useState(initialNote);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(note);
    toast({
      description: "Note saved successfully",
    });
  };

  const forceReaderRefresh = () => {
    const readerContent = document.querySelector('.epub-view') as HTMLElement;
    if (readerContent) {
      // Remove the element
      const parent = readerContent.parentNode;
      if (parent) {
        const clone = readerContent.cloneNode(true);
        parent.removeChild(readerContent);
        // Force a reflow
        void readerContent.offsetHeight;
        // Add the element back
        parent.appendChild(clone);
      }
    }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setNote(initialNote);
    } else {
      // Clean up and force refresh when dialog closes
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      forceReaderRefresh();
      
      // Clear note state after animation completes
      const timeout = setTimeout(() => {
        setNote("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, initialNote]);

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // Clean up and force refresh before closing
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
          forceReaderRefresh();
        }
        onOpenChange(newOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Note</AlertDialogTitle>
          <AlertDialogDescription>
            Add a note to your highlighted text
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Highlighted text:
            </p>
            <p className="text-sm">{highlightedText}</p>
          </div>
          <div className="grid gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button onClick={handleSave}>Save note</Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NoteDialog;