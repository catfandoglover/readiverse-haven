import { useCallback } from 'react';
import type { Rendition, Contents } from "epubjs";
import type { Highlight } from "@/types/highlight";

export const useHighlightManagement = (
  rendition: Rendition | null,
  highlights: Highlight[] = []
) => {
  const clearHighlights = useCallback((contents: Contents) => {
    try {
      const contentsArray = Array.isArray(contents) ? contents : [contents];
      contentsArray.forEach((content) => {
        if (content?.document) {
          const highlights = content.document.querySelectorAll('.epub-highlight');
          highlights.forEach((highlight: Element) => highlight.remove());
        }
      });
    } catch (error) {
      console.error('Error clearing highlights:', error);
    }
  }, []);

  const reapplyHighlights = useCallback(() => {
    if (!rendition) return;
    
    setTimeout(() => {
      highlights.forEach(highlight => {
        try {
          rendition.annotations.add(
            "highlight",
            highlight.cfiRange,
            {},
            undefined,
            "highlight-yellow",
            {
              "fill": "yellow",
              "fill-opacity": "0.3",
              "mix-blend-mode": "multiply"
            }
          );
        } catch (error) {
          console.error('Error reapplying highlight:', error);
        }
      });
    }, 100);
  }, [rendition, highlights]);

  return {
    clearHighlights,
    reapplyHighlights
  };
};