import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Book, Heart, Link2, FileText, Image as ImageIcon, Play, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DetailedIcon } from './DetailedIcon';
import { DetailedConcept } from './DetailedConcept';
import { DetailedClassic } from './DetailedClassic';
import { DetailedQuestion } from './DetailedQuestion';
import useFavorites from '@/hooks/useFavorites';
import useUpdateReadingStatus from '@/hooks/useUpdateReadingStatus';
import useBookshelfManager from '@/hooks/useBookshelfManager';

interface DetailedViewProps {
  type: 'icon' | 'concept' | 'classic' | 'question';
  slug?: string;
  id?: string;
  onClose: () => void;
  refreshFavorites?: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({ type, slug, id, onClose, refreshFavorites }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = null;

        switch (type) {
          case 'icon':
            query = supabase.from('icons').select('*').eq('slug', slug);
            break;
          case 'concept':
            query = supabase.from('concepts').select('*').eq('slug', slug);
            break;
          case 'classic':
            query = supabase.from('classics').select('*').eq('slug', slug);
            break;
          case 'question':
            if (id) {
              query = supabase.from('questions').select('*').eq('id', id);
            }
            break;
          default:
            throw new Error('Invalid content type');
        }

        if (query) {
          const { data, error } = await query.single();

          if (error) {
            throw error;
          }

          setData(data);
        } else {
          throw new Error('ID is required for questions');
        }
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        toast({
          title: "Error",
          description: `Failed to load ${type} details`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, slug, id, toast]);

  const renderDetailedContent = () => {
    if (isLoading) {
      return <div className="text-center">Loading...</div>;
    }

    if (error || !data) {
      return <div className="text-center">Error loading content.</div>;
    }

    switch (type) {
      case 'icon':
        return <DetailedIcon data={data} />;
      case 'concept':
        return <DetailedConcept data={data} />;
      case 'classic':
        return <DetailedClassic data={data} />;
      case 'question':
        return <DetailedQuestion data={data} />;
      default:
        return <div>Unknown content type.</div>;
    }
  };

  const handleToggleFavorite = async () => {
    if (!data?.id) return;
    
    const { toggleFavorite } = useFavorites(data.id, type);
    await toggleFavorite();
    
    // Refetch favorites to update the UI
    if (refreshFavorites) {
      refreshFavorites();
    }
  };

  const handleAddToLibrary = async () => {
    if (!data?.id || !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add books to your library",
        variant: "destructive",
      });
      return;
    }
    
    const { addBookToLibrary } = useBookshelfManager();
    await addBookToLibrary(data.id);
  };

  const handleReadNow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "You must be logged in to read this book",
        variant: "destructive",
      });
      return;
    }
    
    if (data?.id) {
      const { updateReadingStatus } = useUpdateReadingStatus();
      await updateReadingStatus(data.id, 'reading');
      
      // Navigate to reader view
      navigate(`/read/${data.slug}`, {
        state: {
          bookUrl: data.epub_file_url,
          metadata: {
            Cover_super: data.Cover_super
          }
        }
      });
    }
  };

  const getActions = () => {
    if (isLoading || !data) return null;

    switch (type) {
      case 'classic':
        return (
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleReadNow}>
              <Book className="mr-2 h-4 w-4" />
              Read Now
            </Button>
            <Button variant="outline" className="w-full" onClick={handleAddToLibrary}>
              <ListChecks className="mr-2 h-4 w-4" />
              Add to Library
            </Button>
          </div>
        );
      case 'icon':
      case 'concept':
      case 'question':
        return null;
      default:
        return null;
    }
  };

  const getBadges = () => {
    if (isLoading || !data) return null;

    switch (type) {
      case 'icon':
        return (
          <div className="flex flex-wrap gap-1">
            <Badge>{data.category}</Badge>
            {data.tags && data.tags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        );
      case 'concept':
        return (
          <div className="flex flex-wrap gap-1">
            {data.tags && data.tags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        );
      case 'classic':
        return (
          <div className="flex flex-wrap gap-1">
            <Badge>{data.author}</Badge>
          </div>
        );
      case 'question':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="container max-w-4xl mx-auto h-full flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {getBadges()}
            {renderDetailedContent()}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          {getActions()}
          {user && type !== 'question' && (
            <Button variant="ghost" className="w-full justify-start" onClick={handleToggleFavorite}>
              <Heart className="mr-2 h-4 w-4" />
              {data && data.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedView;
