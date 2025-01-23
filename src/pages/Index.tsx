import { useBook } from "@/hooks/useBook";
import { useParams, Navigate } from "react-router-dom";
import Reader from "@/components/Reader";
import Library from "@/components/Library";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading, error } = useBook(bookSlug);

  console.log('Current book slug:', bookSlug);
  console.log('Book data:', book);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading book...</div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/library" replace />;
  }

  if (bookSlug && book) {
    return (
      <Reader 
        metadata={{
          coverUrl: book.cover_url || '',
          title: book.title,
          author: book.author || ''
        }}
        preloadedBookUrl={book.epub_file_url}
        isLoading={isLoading}
      />
    );
  }

  return <Library />;
};

export default Index;