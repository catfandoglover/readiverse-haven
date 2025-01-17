import { useEffect } from 'react';
import type { Rendition } from "epubjs";
import { useHighlightManagement } from './useHighlightManagement';
import type { Highlight } from "@/types/highlight";

export const useFontSizeEffect = (
  rendition: Rendition | null,
  fontSize: number,
  highlights: Highlight[] = [],
  isRenditionReady: boolean
) => {
  const { clearHighlights, reapplyHighlights } = useHighlightManagement(rendition, highlights);

  useEffect(() => {
    if (!rendition || !isRenditionReady) return;

    rendition.themes.fontSize(`${fontSize}%`);
    
    const currentLoc = rendition.location?.start?.cfi;
    if (currentLoc) {
      rendition.display(currentLoc).then(() => {
        try {
          const contents = rendition.getContents();
          if (contents) {
            clearHighlights(contents);
            reapplyHighlights();
          }
        } catch (error) {
          console.error('Error handling highlights:', error);
        }
      });
    }
  }, [fontSize, rendition, highlights, isRenditionReady, clearHighlights, reapplyHighlights]);
};