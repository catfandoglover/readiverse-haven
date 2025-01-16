import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextSelectionMenuProps {
  selectedText: string;
  selectedCfiRange: string;
  onHighlight: (cfiRange: string, text: string, note?: string) => void;
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
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (selectedText && selectedCfiRange) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.top - 50,
          left: rect.left + (rect.width / 2)
        });
      }
    }
  }, [selectedText, selectedCfiRange]);

  const handleHighlight = () => {
    if (selectedText && selectedCfiRange) {
      onHighlight(selectedCfiRange, selectedText);
    }
  };

  const handleCreateNote = () => {
    if (selectedText && selectedCfiRange && note.trim()) {
      onCreateNote(selectedCfiRange, selectedText, note);
      setShowNoteDialog(false);
      setNote('');
    }
  };

  if (!selectedText || !selectedCfiRange) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed z-50 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-2 flex gap-2"
        style={{
          top: `${Math.max(0, position.top)}px`,
          left: `${Math.max(0, position.left)}px`
        }}
      >
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