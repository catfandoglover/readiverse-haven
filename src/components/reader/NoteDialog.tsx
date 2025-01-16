import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setNote(initialNote);
    } else {
      // Clear note state after animation completes
      const timeout = setTimeout(() => {
        setNote("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, initialNote]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to your highlighted text
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button onClick={handleSave}>Save note</Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;