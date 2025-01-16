import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Highlight, HighlightColor } from '@/types/highlight';
import { useToast } from "@/components/ui/use-toast";

export const useHighlights = (bookKey: string | null) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const { toast } = useToast();

  useEffect(() => {
    if (bookKey) {
      const stored = localStorage.getItem(`highlights-${bookKey}`);
      if (stored) {
        try {
          setHighlights(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading highlights:', error);
        }
      }
    }
  }, [bookKey]);

  const saveHighlights = (newHighlights: Highlight[]) => {
    if (bookKey) {
      localStorage.setItem(`highlights-${bookKey}`, JSON.stringify(newHighlights));
      setHighlights(newHighlights);
    }
  };

  const addHighlight = (cfiRange: string, text: string) => {
    if (!bookKey) return;

    const newHighlight: Highlight = {
      id: uuidv4(),
      cfiRange,
      color: selectedColor,
      text,
      createdAt: Date.now(),
      bookKey
    };

    const newHighlights = [...highlights, newHighlight];
    saveHighlights(newHighlights);
    
    toast({
      description: "Highlight added successfully",
    });
  };

  const addHighlightWithNote = (cfiRange: string, text: string, note: string) => {
    if (!bookKey) return;

    const newHighlight: Highlight = {
      id: uuidv4(),
      cfiRange,
      color: selectedColor,
      text,
      note,
      createdAt: Date.now(),
      bookKey
    };

    const newHighlights = [...highlights, newHighlight];
    saveHighlights(newHighlights);
    
    toast({
      description: "Note added successfully",
    });
  };

  const removeHighlight = (id: string) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    saveHighlights(newHighlights);
    
    toast({
      description: "Highlight removed successfully",
    });
  };

  const updateHighlight = (id: string, updates: Partial<Highlight>) => {
    const newHighlights = highlights.map(h => 
      h.id === id ? { ...h, ...updates } : h
    );
    saveHighlights(newHighlights);
  };

  return {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    addHighlightWithNote,
    removeHighlight,
    updateHighlight
  };
};