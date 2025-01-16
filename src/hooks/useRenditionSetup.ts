import { useState, useEffect, useCallback } from 'react';
import type { Book, Rendition } from "epubjs";
import { debounce } from "lodash";
import type { Highlight } from "@/types/highlight";
import Contents from "epubjs/types/contents";

export const useRenditionSetup = (
  book: Book,
  isMobile: boolean,
  textAlign: 'left' | 'justify' | 'center',
  fontFamily: 'georgia' | 'helvetica' | 'times',
  theme: { text: string; background: string },
  currentLocation: string | null,
  onLocationChange: (location: any) => void,
  onTextSelect?: (cfiRange: string, text: string) => void,
  highlights: Highlight[] = [],
) => {
  const [rendition, setRendition] = useState<Rendition | null>(null);

  const getFontFamily = (font: 'georgia' | 'helvetica' | 'times') => {
    switch (font) {
      case 'georgia':
        return 'Georgia, serif';
      case 'helvetica':
        return 'Helvetica, Arial, sans-serif';
      case 'times':
        return 'Times New Roman, serif';
      default:
        return 'Georgia, serif';
    }
  };

  const setupRendition = (container: Element) => {
    if (!book) return null;

    const newRendition = book.renderTo(container, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: isMobile ? "none" : "always",
      minSpreadWidth: 0,
    });

    newRendition.themes.default({
      body: {
        "column-count": isMobile ? "1" : "2",
        "column-gap": "2em",
        "column-rule": isMobile ? "none" : "1px solid #e5e7eb",
        padding: "1em",
        "text-align": textAlign,
        "font-family": getFontFamily(fontFamily),
        color: theme.text,
        background: theme.background,
      },
      '.highlight-yellow': {
        'background-color': 'rgba(255, 235, 59, 0.3)',
      }
    });

    // Text selection handler
    newRendition.on("selected", (cfiRange: string, contents: Contents) => {
      const selection = contents.window.getSelection();
      if (!selection) return;

      const text = selection.toString().trim();
      if (!text || !onTextSelect) return;

      onTextSelect(cfiRange, text);
      selection.removeAllRanges();
    });

    // Apply existing highlights
    highlights.forEach(highlight => {
      try {
        newRendition.annotations.add(
          "highlight",
          highlight.cfiRange,
          {},
          undefined,
          "highlight-yellow"
        );
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    });

    // Location change handler
    newRendition.on("relocated", (location: any) => {
      onLocationChange(location);
      
      const contents = newRendition.getContents();
      if (contents && Array.isArray(contents) && contents.length > 0) {
        const currentView = contents[0].document;
        
        let heading = currentView.querySelector('h2 a[id^="link2H_"]');
        if (heading) {
          heading = heading.parentElement;
        } else {
          heading = currentView.querySelector('h1, h2, h3, h4, h5, h6');
        }
        
        const chapterTitle = heading ? heading.textContent?.trim() : "Unknown Chapter";
        window.dispatchEvent(new CustomEvent('chapterTitleChange', { 
          detail: { title: chapterTitle } 
        }));
      }
    });

    return newRendition;
  };

  return {
    rendition,
    setRendition,
    setupRendition,
  };
};