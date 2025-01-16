import { useState, useEffect } from 'react';
import { Highlight, HighlightColor } from '@/types/highlight';
import { useToast } from '@/components/ui/use-toast';
import { Book } from 'epubjs';
import { v4 as uuid } from 'uuid';

export const useHighlights = (book: Book | null) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentColor, setCurrentColor] = useState<HighlightColor>('yellow');
  const { toast } = useToast();

  useEffect(() => {
    if (!book) return;
    
    const bookKey = book.key();
    const stored = localStorage.getItem(`book-highlights-${bookKey}`);
    if (stored) {
      try {
        setHighlights(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    }
  }, [book]);

  const saveHighlights = (newHighlights: Highlight[]) => {
    if (!book) return;
    
    const bookKey = book.key();
    localStorage.setItem(`book-highlights-${bookKey}`, JSON.stringify(newHighlights));
    setHighlights(newHighlights);
  };

  const createHighlight = (cfi: string, text: string, chapterInfo?: string) => {
    if (!book) return;

    const highlight: Highlight = {
      id: uuid(),
      cfi,
      text,
      color: currentColor,
      createdAt: Date.now(),
      chapterInfo
    };

    const newHighlights = [...highlights, highlight];
    saveHighlights(newHighlights);

    toast({
      description: "Highlight saved",
    });

    return highlight;
  };

  const removeHighlight = (id: string) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    saveHighlights(newHighlights);
    
    toast({
      description: "Highlight removed",
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
    currentColor,
    setCurrentColor,
    createHighlight,
    removeHighlight,
    updateHighlight
  };
};