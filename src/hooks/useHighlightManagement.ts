import { useCallback } from 'react';
import type { Rendition } from "epubjs";
import type { Highlight } from "@/types/highlight";

export const useHighlightManagement = (
  rendition: Rendition | null,
  highlights: Highlight[] = []
) => {
  const clearHighlights = useCallback((contents: any) => {
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
    
    try {
      // Clear existing highlights first
      const contents = rendition.getContents();
      if (Array.isArray(contents)) {
        contents.forEach(content => {
          clearHighlights(content);
        });
      }

      // Add all highlights
      highlights.forEach(highlight => {
        try {
          rendition.annotations.remove(highlight.cfiRange, 'highlight');
          rendition.annotations.add(
            "highlight",
            highlight.cfiRange,
            {},
            undefined,
            `highlight-${highlight.color}`,
            {
              "fill": highlight.color,
              "fill-opacity": "0.3",
              "mix-blend-mode": "multiply"
            }
          );
        } catch (error) {
          console.error('Error applying highlight:', error);
        }
      });
    } catch (error) {
      console.error('Error reapplying highlights:', error);
    }
  }, [rendition, highlights, clearHighlights]);

  return {
    clearHighlights,
    reapplyHighlights
  };
};