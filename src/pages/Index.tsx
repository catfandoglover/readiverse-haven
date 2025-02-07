import { useParams } from 'react-router-dom';
import { useBook } from '@/hooks/useBook';
import Reader from "@/components/Reader";
import Header from "@/components/ui/header";
import type { BookMetadata } from "@/types/reader";

const defaultMetadata: BookMetadata = {
  coverUrl: "/placeholder.svg",
  title: "Upload a Book",
  author: ""
};

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading, error } = useBook(bookSlug);

  const metadata = book ? {
    coverUrl: book.Cover_super || "/placeholder.svg",
    title: book.title,
    author: book.author
  } : defaultMetadata;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Reader 
          metadata={metadata}
          preloadedBookUrl={book?.epub_file_url}
          isLoading={isLoading} 
          error={error}
        />
      </main>
    </div>
  );
};

export default Index;