import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HighlightColor } from '@/types/highlight';

interface TextSelectionMenuProps {
  selectedText: string;
  selectedCfiRange: string;
  onHighlight: (cfiRange: string, text: string) => void;
  onCreateNote: (cfiRange: string, text: string, note: string) => void;
}

const TextSelectionMenu = ({
  selectedText,
  selectedCfiRange,
  onHighlight,
  onCreateNote,
}: TextSelectionMenuProps) => {
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [note, setNote] = useState('');

  const handleHighlight = () => {
    onHighlight(selectedCfiRange, selectedText);
  };

  const handleCreateNote = () => {
    onCreateNote(selectedCfiRange, selectedText, note);
    setShowNoteDialog(false);
    setNote('');
  };

  return (
    <>
      <div className="fixed transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleHighlight}>
          Highlight
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowNoteDialog(true)}>
          Add Note
        </Button>
      </div>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm italic">{selectedText}</p>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TextSelectionMenu;