// src/pages/Index.tsx
import { useParams } from 'react-router-dom';
import { useBook } from '@/hooks/useBook';
import Reader from "@/components/Reader";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading, error } = useBook(bookSlug);

  // Debug logs
  console.log('Current state:', {
    bookSlug,
    book,
    isLoading,
    error,
    hasEpubUrl: book?.epub_file_url ? 'yes' : 'no'
  });

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Handle error or no book found
  if (error || (!isLoading && !book)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error ? error.message : `Unable to find book with slug: ${bookSlug}`}
          </p>
          <a href="/" className="text-blue-500 hover:underline">
            Return Home
          </a>
        </div>
      </div>
    );
  }

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
      ) : error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
            <p className="text-gray-600">Sorry, we couldn't find the book you're looking for.</p>
            {/* Add a return to home link */}
            <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      ) : (
        <Reader metadata={bookMetadata} preloadedBookUrl={book?.epub_file_url} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Index;
