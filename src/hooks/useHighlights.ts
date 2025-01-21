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

  const removeHighlight = (id: string) => {
    // Find the highlight to be removed
    const highlightToRemove = highlights.find(h => h.id === id);
    if (!highlightToRemove) return;

    // Remove from state and localStorage
    const newHighlights = highlights.filter(h => h.id !== id);
    saveHighlights(newHighlights);

    // Dispatch a custom event to notify the BookViewer component
    window.dispatchEvent(new CustomEvent('removeHighlight', {
      detail: { cfiRange: highlightToRemove.cfiRange }
    }));
    
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
    removeHighlight,
    updateHighlight
  };
};