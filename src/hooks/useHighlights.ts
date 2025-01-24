import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Highlight, HighlightColor } from '@/types/highlight';
import { useToast } from "@/hooks/use-toast";

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
    if (!bookKey) return;
    try {
      localStorage.setItem(`highlights-${bookKey}`, JSON.stringify(newHighlights));
      setHighlights(newHighlights);
    } catch (error) {
      console.error('Error saving highlights:', error);
      toast({
        variant: "destructive",
        description: "Failed to save highlights",
      });
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

  const removeHighlight = (id: string) => {
    const highlightToRemove = highlights.find(h => h.id === id);
    if (!highlightToRemove) {
      console.error('Highlight not found:', id);
      return;
    }

    try {
      // Remove from state and localStorage first
      const newHighlights = highlights.filter(h => h.id !== id);
      setHighlights(newHighlights); // Update state immediately
      localStorage.setItem(`highlights-${bookKey}`, JSON.stringify(newHighlights));

      // Then dispatch event to remove from view
      window.dispatchEvent(new CustomEvent('removeHighlight', {
        detail: { cfiRange: highlightToRemove.cfiRange }
      }));
    } catch (error) {
      console.error('Error removing highlight:', error);
      toast({
        variant: "destructive",
        description: "Failed to remove highlight",
      });
    }
  };

  return {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight
  };
};