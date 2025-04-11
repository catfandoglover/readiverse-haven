import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";

// Type assertion to silence TypeScript errors
// This is necessary because the type definitions don't include all the methods we need
const supabaseAny = supabase as any;

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  slug?: string;
  epub_file_url?: string;
}

interface IntellectualDNABook {
  id: string;
  user_id: string;
  domain: string;
  type: string;
  position: number;
  book_id: string;
  created_at: string;
  updated_at: string;
  book?: Book;
}

type DomainGroup = {
  domain: string;
  label: string;
  description: string;
  kindredBooks: IntellectualDNABook[];
  challengingBooks: IntellectualDNABook[];
};

const domainConfig = [
  { 
    id: "ethics", 
    label: "ETHICS", 
    description: "Books that explore moral principles, values, and ethical frameworks."
  },
  { 
    id: "theology", 
    label: "THEOLOGY", 
    description: "Books that explore religious beliefs, concepts of divinity, and spiritual experiences."
  },
  { 
    id: "epistemology", 
    label: "EPISTEMOLOGY", 
    description: "Books that examine the nature and grounds of knowledge, belief, and truth."
  },
  { 
    id: "ontology", 
    label: "ONTOLOGY", 
    description: "Books that explore the nature of being, existence, and reality."
  },
  { 
    id: "politics", 
    label: "POLITICS", 
    description: "Books that examine systems of governance, power dynamics, and social organization."
  },
  { 
    id: "aesthetics", 
    label: "AESTHETICS", 
    description: "Books that explore beauty, art, taste, and creative expression."
  }
];

const IntellectualDNAShelf: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ethics");
  
  const { data: dnaBooks, isLoading } = useQuery({
    queryKey: ["intellectual-dna-books", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        // Fetch books from the intellectual_dna_shelf table
        const { data: shelfBooks, error: shelfError } = await supabaseAny
          .from("intellectual_dna_shelf")
          .select("*")
          .eq("user_id", user.id);
        
        if (shelfError) {
          console.error("Error fetching intellectual DNA shelf books:", shelfError);
          return [];
        }
        
        if (!shelfBooks?.length) {
          console.log("No intellectual DNA shelf books found for user");
          return [];
        }
        
        // Fetch the book details for each book ID
        const bookIds = shelfBooks.map(sb => sb.book_id).filter(Boolean);
        
        if (!bookIds.length) {
          console.log("No valid book IDs found");
          return shelfBooks;
        }
        
        const { data: booksData, error: booksError } = await supabaseAny
          .from("books")
          .select("id, title, author, cover_url, slug, epub_file_url")
          .in("id", bookIds);
          
        if (booksError) {
          console.error("Error fetching books:", booksError);
          return shelfBooks;
        }
        
        // Combine the data
        return shelfBooks.map(sb => {
          const bookData = booksData?.find(b => b.id === sb.book_id);
          return {
            ...sb,
            book: bookData
          };
        });
      } catch (err) {
        console.error("Exception fetching intellectual DNA shelf books:", err);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Group books by domain and type
  const domainGroups: DomainGroup[] = React.useMemo(() => {
    if (!dnaBooks || !dnaBooks.length) {
      return domainConfig.map(domain => ({
        domain: domain.id,
        label: domain.label,
        description: domain.description,
        kindredBooks: [],
        challengingBooks: []
      }));
    }

    return domainConfig.map(domain => {
      const domainBooks = dnaBooks.filter(book => book.domain === domain.id);
      return {
        domain: domain.id,
        label: domain.label,
        description: domain.description,
        kindredBooks: domainBooks.filter(book => book.type === 'kindred').sort((a, b) => a.position - b.position),
        challengingBooks: domainBooks.filter(book => book.type === 'challenging').sort((a, b) => a.position - b.position)
      };
    });
  }, [dnaBooks]);

  const handleBookClick = (book: IntellectualDNABook) => {
    if (book.book?.epub_file_url) {
      navigate(`/read/${book.book_id}`, { 
        state: { 
          bookUrl: book.book.epub_file_url,
          metadata: { 
            Cover_super: book.book.cover_url,
            id: book.book_id
          }
        } 
      });
    } else if (book.book?.slug) {
      navigate(`/book/${book.book.slug}`);
    } else {
      navigate(`/book/${book.book_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Intellectual DNA Bookshelf</h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-40 w-full rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if there are any books in the DNA shelf
  const hasAnyBooks = domainGroups.some(
    domain => domain.kindredBooks.length > 0 || domain.challengingBooks.length > 0
  );

  if (!hasAnyBooks) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Intellectual DNA Bookshelf</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No books in your Intellectual DNA Shelf yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Complete your Intellectual DNA assessment to discover books that match your philosophical inclinations.
          </p>
          <Button onClick={() => navigate("/courses/intellectual-dna")}>
            Take the Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Intellectual DNA Bookshelf</h2>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          {domainGroups.map(domain => (
            <TabsTrigger 
              key={domain.domain} 
              value={domain.domain}
              className="px-4 py-2"
            >
              {domain.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {domainGroups.map(domain => (
          <TabsContent key={domain.domain} value={domain.domain} className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {domain.description}
            </p>

            {/* Kindred Spirits Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Kindred Spirits</h3>
              {domain.kindredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {domain.kindredBooks.map(bookEntry => (
                    <div 
                      key={bookEntry.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleBookClick(bookEntry)}
                    >
                      {bookEntry.book?.cover_url ? (
                        <img 
                          src={bookEntry.book.cover_url} 
                          alt={bookEntry.book?.title || 'Book cover'} 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium line-clamp-1">{bookEntry.book?.title || 'Unknown Title'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{bookEntry.book?.author || 'Unknown Author'}</p>
                        <div className="flex justify-end mt-2">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No kindred spirit books found for this domain.</p>
              )}
            </div>

            {/* Challenging Voices Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Challenging Voices</h3>
              {domain.challengingBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {domain.challengingBooks.map(bookEntry => (
                    <div 
                      key={bookEntry.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleBookClick(bookEntry)}
                    >
                      {bookEntry.book?.cover_url ? (
                        <img 
                          src={bookEntry.book.cover_url} 
                          alt={bookEntry.book?.title || 'Book cover'} 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium line-clamp-1">{bookEntry.book?.title || 'Unknown Title'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{bookEntry.book?.author || 'Unknown Author'}</p>
                        <div className="flex justify-end mt-2">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No challenging voice books found for this domain.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default IntellectualDNAShelf; 