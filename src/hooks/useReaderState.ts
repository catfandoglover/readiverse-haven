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
      const { data, error } = await supabase
        .from('external_links')
        .select('url')
        .single();
      
      if (data && !error) {
        setExternalLink(data.url);
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