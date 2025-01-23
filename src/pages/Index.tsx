import { useBook } from "@/hooks/useBook";
import { useParams } from "react-router-dom";
import Reader from "@/components/Reader";
import Library from "@/components/Library";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book, isLoading } = useBook(bookSlug);

  if (bookSlug && book) {
    return (
      <Reader 
        metadata={{
          coverUrl: book.cover_url || undefined,
          title: book.title,
          author: book.author || undefined
        }}
        preloadedBookUrl={book.epub_file_url}
        isLoading={isLoading}
      />
    );
  }

  return <Library />;
};

export default Index;