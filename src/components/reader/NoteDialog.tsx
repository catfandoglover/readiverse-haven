import React from 'react';
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

  React.useEffect(() => {
    if (open) {
      setNote(initialNote);
    } else {
      setNote("");
    }
  }, [open, initialNote]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Ensure we clean up properly when closing
      setTimeout(() => {
        onOpenChange(false);
      }, 0);
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to your highlighted text
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;