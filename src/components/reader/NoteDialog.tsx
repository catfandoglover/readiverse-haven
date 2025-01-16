import React, { useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
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
      // Prevent background scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when drawer closes
      document.body.style.overflow = 'unset';
      // Clear note state after animation completes
      const timeout = setTimeout(() => {
        setNote("");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, initialNote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <Drawer 
      open={open} 
      onOpenChange={(newOpen) => {
        // Add a small delay before closing to ensure proper cleanup
        if (!newOpen) {
          setTimeout(() => {
            onOpenChange(newOpen);
          }, 0);
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <DrawerContent className="focus-visible:outline-none">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Note</DrawerTitle>
            <DrawerDescription>
              Add a note to your highlighted text
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
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
          </div>
          <DrawerFooter>
            <Button onClick={handleSave}>Save note</Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NoteDialog;