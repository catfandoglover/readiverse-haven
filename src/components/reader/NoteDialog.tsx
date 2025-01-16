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

  // Ensure we clean up any lingering overlay effects
  useEffect(() => {
    if (!open) {
      // Force remove any lingering overlay effects
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Ensure we clean up before closing
        if (!newOpen) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
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