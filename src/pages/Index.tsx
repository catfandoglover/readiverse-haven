import { useBook } from "@/hooks/useBook";
import { useParams } from "react-router-dom";
import Reader from "@/components/Reader";
import Library from "@/components/Library";

const Index = () => {
  const { bookSlug } = useParams();
  const { data: book } = useBook(bookSlug);

  if (bookSlug && book) {
    return <Reader book={book} />;
  }

  return <Library />;
};

export default Index;