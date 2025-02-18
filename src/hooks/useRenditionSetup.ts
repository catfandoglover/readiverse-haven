import { useCallback } from 'react';
import type { Book, Contents, Rendition } from 'epubjs';
import type { Theme } from '@/contexts/ThemeContext';
import type { Highlight } from '@/types/highlight';

export const useRenditionSetup = (
  book: Book,
  isMobile: boolean,
  textAlign: 'left' | 'justify' | 'center',
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times',
  theme: Theme,
  currentLocation: string | null,
  onLocationChange: (location: any) => void,
  onTextSelect?: (cfiRange: string, text: string) => void,
  highlights?: Highlight[]
) => {
  const setupRendition = useCallback((container: Element) => {
    if (!book) return null;

    const rendition = book.renderTo(container, {
      width: '100%',
      height: '100%',
      spread: isMobile ? 'none' : 'auto',
    });

    // Apply theme colors and text settings
    rendition.themes.default({
      body: {
        background: theme.background,
        color: theme.text,
        'text-align': textAlign,
        'font-family': fontFamily === 'lexend' ? 
          "'Lexend', sans-serif" : 
          fontFamily === 'georgia' ? 
          'Georgia, serif' : 
          fontFamily === 'helvetica' ? 
          'Helvetica, Arial, sans-serif' : 
          'Times New Roman, serif',
      },
      'a, h1, h2, h3, h4, h5, h6': {
        color: theme.accent,
      },
      'p': {
        'font-family': fontFamily === 'lexend' ? 
          "'Lexend', sans-serif" : 
          fontFamily === 'georgia' ? 
          'Georgia, serif' : 
          fontFamily === 'helvetica' ? 
          'Helvetica, Arial, sans-serif' : 
          'Times New Roman, serif',
      }
    });

    // Text selection handler
    rendition.on("selected", (cfiRange: string, contents: Contents) => {
      const selection = contents.window.getSelection();
      if (!selection) return;

      const text = selection.toString().trim();
      if (!text || !onTextSelect) return;

      onTextSelect(cfiRange, text);
      selection.removeAllRanges();
    });

    // Apply existing highlights
    highlights?.forEach(highlight => {
      try {
        rendition.annotations.add(
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
    rendition.on("relocated", (location: any) => {
      onLocationChange(location);
      
      const contents = rendition.getContents();
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

    return rendition;
  }, [book, isMobile, textAlign, fontFamily, theme, currentLocation, onLocationChange, onTextSelect]);

  return {
    setupRendition,
  };
};
