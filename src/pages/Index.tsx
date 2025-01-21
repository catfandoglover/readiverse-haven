// src/pages/Index.tsx
import { useParams } from 'react-router-dom';
import { useBook } from '@/hooks/useBook';
import Reader from "@/components/Reader";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading, error } = useBook(bookSlug);
  
  console.log('Book data in Index:', book);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  const bookMetadata = book ? {
    coverUrl: book.cover_url || "/placeholder.svg",
    title: book.title,
    author: book.author
  } : {
    coverUrl: "/placeholder.svg",
    title: "Upload a Book",
    author: ""
  };

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <Reader metadata={bookMetadata} preloadedBookUrl={book?.epub_file_url} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Index;
