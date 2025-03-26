
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";

const AestheticsContent: React.FC = () => {
  const { data: books, isLoading } = useQuery({
    queryKey: ["aesthetics-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, cover_url, slug, epub_file_url")
        .ilike('category', '%aesthetics%');
      
      if (error) {
        console.error("Error fetching aesthetics books:", error);
        return [];
      }
      
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // If no books from the database, use our fallback
  const displayBooks = books?.length ? books : [
    {
      id: "1",
      title: "Critique of Judgment",
      author: "Immanuel Kant",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "2",
      title: "The Birth of Tragedy",
      author: "Friedrich Nietzsche",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "3",
      title: "Art as Experience",
      author: "John Dewey",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayBooks.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          author={book.author}
          cover_url={book.cover_url}
          slug={book.slug}
          epub_file_url={book.epub_file_url}
        />
      ))}
    </div>
  );
};

export default AestheticsContent;
