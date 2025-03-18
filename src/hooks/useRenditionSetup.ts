
import { useCallback, useState } from 'react';
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
  const [rendition, setRendition] = useState<Rendition | null>(null);

  const setupRendition = useCallback((container: Element) => {
    if (!book) return null;

    const newRendition = book.renderTo(container, {
      width: '100%',
      height: '100%',
      spread: isMobile ? 'none' : 'auto',
      flow: 'paginated',
      minSpreadWidth: 800,
    });

    // Apply theme colors and text settings
    newRendition.themes.default({
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
        'padding': '0 1.5rem',
        'line-height': '1.6',
        'margin': '0 auto',
        'max-width': '42rem',
      },
      'a, h1, h2, h3, h4, h5, h6': {
        color: theme.accent,
        'line-height': '1.3',
      },
      'p': {
        'font-family': fontFamily === 'lexend' ? 
          "'Lexend', sans-serif" : 
          fontFamily === 'georgia' ? 
          'Georgia, serif' : 
          fontFamily === 'helvetica' ? 
          'Helvetica, Arial, sans-serif' : 
          'Times New Roman, serif',
        'margin-bottom': '1em',
      },
      'img': {
        'max-width': '100%',
        'height': 'auto',
        'display': 'block',
        'margin': '1em auto',
      },
      'blockquote': {
        'border-left': `2px solid ${theme.accent}`,
        'padding-left': '1em',
        'margin-left': '0',
        'font-style': 'italic',
      },
      '.epub-container': {
        'overflow': 'hidden',
        'width': '100%',
        'height': '100%',
        'max-width': '100%',
      },
      'ul, ol': {
        'padding-left': '1.5em',
        'margin-bottom': '1em',
      },
      'li': {
        'margin-bottom': '0.5em',
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
    highlights?.forEach(highlight => {
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

    // Improve mobile touch response
    newRendition.on("rendered", (_section: any) => {
      const contents = newRendition.getContents();
      contents.forEach((content) => {
        if (content.document && content.document.body) {
          // Better touch gestures
          content.document.body.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
              e.preventDefault(); // Prevent zooming
            }
          }, { passive: false });
        }
      });
    });

    setRendition(newRendition);
    return newRendition;
  }, [book, isMobile, textAlign, fontFamily, theme, currentLocation, onLocationChange, onTextSelect, highlights]);

  return {
    rendition,
    setRendition,
    setupRendition,
  };
};
