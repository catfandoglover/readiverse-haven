
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const INITIAL_PAGE_SIZE = 10;

export type ContentType = 'classic' | 'icon' | 'concept' | 'question' | 'for-you';

export interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  question?: string;
  type: ContentType;
  image?: string;
  illustration?: string;
  cover_url?: string;
  Cover_super?: string;
  about?: string;
  author?: string;
  [key: string]: any;
}

interface UseContentDataProps {
  contentType: ContentType;
  initialPageSize?: number;
}

export const useContentData = ({ contentType, initialPageSize = INITIAL_PAGE_SIZE }: UseContentDataProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Choose the appropriate table and fields based on content type
  const getQueryDetails = () => {
    switch (contentType) {
      case 'classic':
        return {
          table: 'books',
          imageField: 'Cover_super,cover_url,icon_illustration',
          titleField: 'title',
          mapFunction: (item: any): ContentItem => ({
            ...item,
            type: 'classic',
            image: item.Cover_super || item.cover_url || item.icon_illustration || '',
            title: item.title,
            about: item.about || `A classic work by ${item.author || 'Unknown Author'}.`
          })
        };
      case 'icon':
        return {
          table: 'icons',
          imageField: 'illustration',
          titleField: 'name',
          mapFunction: (item: any): ContentItem => ({
            ...item,
            type: 'icon',
            image: item.illustration || '',
            title: item.name,
            about: item.about || `${item.name} was a significant figure in philosophical history.`
          })
        };
      case 'concept':
        return {
          table: 'concepts',
          imageField: 'illustration',
          titleField: 'title',
          mapFunction: (item: any): ContentItem => ({
            ...item,
            type: 'concept',
            image: item.illustration || '',
            title: item.title,
            about: item.about || `${item.title} is a significant philosophical concept.`
          })
        };
      case 'question':
        return {
          table: 'great_questions',
          imageField: 'illustration',
          titleField: 'question',
          mapFunction: (item: any): ContentItem => ({
            ...item,
            type: 'question',
            image: item.illustration || '',
            title: item.question,
            about: item.great_conversation || 'Explore this great question...'
          })
        };
      case 'for-you':
        // Special case - will be handled separately
        return {
          table: '',
          imageField: '',
          titleField: '',
          mapFunction: (item: any): ContentItem => item
        };
    }
  };

  // If for-you, we'll need to query multiple tables
  const isForYou = contentType === 'for-you';

  // Get the appropriate query details based on content type
  const { table, imageField, titleField, mapFunction } = getQueryDetails();

  // Query for standard content types (not for-you)
  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: [contentType, loadedCount],
    queryFn: async () => {
      try {
        if (isForYou) {
          // For the "For You" feed, fetch a mix of content types
          const [booksResponse, iconsResponse, conceptsResponse, questionsResponse] = await Promise.all([
            supabase.from("books").select("*").order("randomizer").limit(Math.ceil(loadedCount / 4)),
            supabase.from("icons").select("*").order("randomizer").limit(Math.ceil(loadedCount / 4)),
            supabase.from("concepts").select("*").order("randomizer").limit(Math.ceil(loadedCount / 4)),
            supabase.from("great_questions").select("*").order("randomizer").limit(Math.ceil(loadedCount / 4)),
          ]);

          // Process and combine the results
          const books = (booksResponse.data || []).map(book => ({
            ...book,
            type: 'classic' as ContentType,
            image: book.Cover_super || book.cover_url || book.icon_illustration || '',
            title: book.title,
            about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`
          }));

          const icons = (iconsResponse.data || []).map(icon => ({
            ...icon,
            type: 'icon' as ContentType,
            image: icon.illustration || '',
            title: icon.name,
            about: icon.about || `${icon.name} was a significant figure in philosophical history.`
          }));

          const concepts = (conceptsResponse.data || []).map(concept => ({
            ...concept,
            type: 'concept' as ContentType,
            image: concept.illustration || '',
            title: concept.title,
            about: concept.about || `${concept.title} is a significant philosophical concept.`
          }));

          const questions = (questionsResponse.data || []).map(question => ({
            ...question,
            type: 'question' as ContentType,
            image: question.illustration || '',
            title: question.question,
            about: question.great_conversation || 'Explore this great question...'
          }));

          // Combine all content types and shuffle
          const combined = [...books, ...icons, ...concepts, ...questions];
          // Simple Fisher-Yates shuffle
          for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
          }

          // Get total counts for tracking
          setTotalCount(
            (booksResponse.count || 0) + 
            (iconsResponse.count || 0) + 
            (conceptsResponse.count || 0) + 
            (questionsResponse.count || 0)
          );

          return combined;
        } else {
          // For standard content types, fetch from a single table
          // First get the total count
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!countError) {
            setTotalCount(count || 0);
          }
          
          // Then fetch the actual data
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('randomizer')
            .range(0, loadedCount - 1);

          if (error) {
            console.error(`Error fetching ${contentType} content:`, error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to load ${contentType} content`,
            });
            return [];
          }

          // Map the data to our standardized format
          return data.map(mapFunction);
        }
      } catch (error) {
        console.error(`Error fetching ${contentType} content:`, error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load ${contentType} content`,
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Load more items when we're approaching the end
  useEffect(() => {
    // If we're within 3 items of the end, load more
    if (currentIndex >= loadedCount - 3 && loadedCount < totalCount) {
      const newLoadedCount = Math.min(loadedCount + INITIAL_PAGE_SIZE, totalCount);
      setLoadedCount(newLoadedCount);
    }
  }, [currentIndex, loadedCount, totalCount]);

  // Refetch when loadedCount changes
  useEffect(() => {
    refetch();
  }, [loadedCount, refetch]);

  const handleNext = () => {
    if (items.length > 0 && currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentItem = items[currentIndex] || null;
  const hasNext = items.length > 0 && currentIndex < items.length - 1;
  const hasPrevious = currentIndex > 0;

  return {
    currentItem,
    currentIndex,
    setCurrentIndex,
    items,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious,
    refetch
  };
};
