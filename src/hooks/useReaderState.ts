import { useState, useEffect } from 'react';
import type { Book } from "epubjs";
import type { NavItem } from 'epubjs';
import { supabase } from "@/integrations/supabase/client";

export const useReaderState = () => {
  const [isReading, setIsReading] = useState(false);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [externalLink, setExternalLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchExternalLink = async () => {
      try {
        const { data, error } = await supabase
          .from('external_links')
          .select('url')
          .maybeSingle();
        
        if (data && !error) {
          setExternalLink(data.url);
        } else if (error) {
          console.error('Error fetching external link:', error);
        }
      } catch (error) {
        console.error('Error in fetchExternalLink:', error);
      }
    };

    fetchExternalLink();
  }, []);

  const handleBookLoad = (book: Book | null) => {
    setIsReading(!!book);
    if (book) {
      book.loaded.navigation.then(nav => {
        setToc(nav.toc);
      });
    }
  };

  return {
    isReading,
    toc,
    externalLink,
    handleBookLoad
  };
};