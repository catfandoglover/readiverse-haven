
import React from 'react';
import { useParams } from 'react-router-dom';
import { Reader } from '@/components/Reader';
import { useBook } from '@/hooks/useBook';

const BookshelfBookView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id || '');

  return (
    <Reader 
      metadata={{ Cover_super: book?.Cover_super || book?.cover_url }}
      preloadedBookUrl={book?.epub_file_url}
      isLoading={isLoading}
    />
  );
};

export default BookshelfBookView;
