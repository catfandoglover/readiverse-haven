import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

interface BookLinkButtonProps {
  book: Book;
  className?: string;
}

const BookLinkButton = ({ book, className }: BookLinkButtonProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/${book.slug}`);
  };

  return (
    <Button 
      onClick={handleClick}
      className={className}
    >
      Read Now
    </Button>
  );
};

export default BookLinkButton;