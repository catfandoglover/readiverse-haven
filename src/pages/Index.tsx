// src/pages/Index.tsx
import { useParams } from 'react-router-dom';
import { useBook } from '@/hooks/useBook';
import Reader from "@/components/Reader";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading } = useBook(bookSlug);

  const bookMetadata = book ? {
    coverUrl: book.cover_url || "/placeholder.svg",
    title: book.title,
    author: book.author
  } : {
    coverUrl: "/placeholder.svg",
    title: "Upload a Book",
    author: ""
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Reader metadata={bookMetadata} preloadedBookUrl={book?.epub_file_url} />
    </div>
  );
};

export default Index;
