import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileData } from "@/contexts/ProfileDataContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Type assertion to silence TypeScript errors
const supabaseAny = supabase as any;

// Define Shelf type if not already globally available
interface Shelf {
  id: string;
  name: string;
}

interface CarouselBooksContentProps {
  shelfFilter?: string;
  userId?: string;
  customShelves?: Shelf[];
  onRemoveBookFromLibrary?: (bookId: string) => void;
  onAddBookToShelf?: (bookId: string, shelfId: string) => void;
  onRemoveBookFromShelf?: (bookId: string) => void;
}

const CarouselBooksContent: React.FC<CarouselBooksContentProps> = ({ 
  shelfFilter = "all",
  userId,
  customShelves = [],
  onRemoveBookFromLibrary,
  onAddBookToShelf,
  onRemoveBookFromShelf
}) => {
  const { user } = useAuth();
  const { dnaAnalysisData } = useProfileData();
  const isMobile = useIsMobile();
  const assessmentId = dnaAnalysisData?.assessment_id;
  const [dnaBooksProcessed, setDnaBooksProcessed] = useState<boolean>(false);

  // Query for user books
  const { data: userBooks, isLoading: isLoadingUserBooks } = useQuery({
    queryKey: ["all-user-books", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        console.log("Fetching books for user:", user.id);
        
        // First get the user books entries
        const { data: userBooks, error: userBooksError } = await supabaseAny
          .from("user_books")
          .select("*")
          .eq("user_id", user.id);
        
        if (userBooksError) {
          console.error("Error fetching user books:", userBooksError);
          return [];
        }
        
        if (!userBooks?.length) {
          console.log("No user books found for user");
          return [];
        }
        
        return userBooks;
      } catch (err) {
        console.error("Exception fetching user books:", err);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Query for DNA matched books
  const { data: dnaBooks, isLoading: isLoadingDnaBooks } = useQuery({
    queryKey: ["dna-matched-books", assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];

      try {
        console.log("Fetching DNA books for assessment:", assessmentId);
        
        // Get all matches with "classic" suffix in field_name
        const { data: matchedResults, error: matchError } = await supabaseAny
          .from("dna_analysis_results_matched")
          .select("matched_id, dna_analysis_column")
          .eq("assessment_id", assessmentId)
          .like("dna_analysis_column", `%_classic`);
        
        if (matchError) {
          console.error("Error fetching DNA matched results:", matchError);
          return [];
        }
        
        if (!matchedResults?.length) {
          console.log("No DNA matched books found");
          return [];
        }
        
        return matchedResults.map(match => ({
          book_id: match.matched_id,
          isDnaBook: true,
          dna_analysis_column: match.dna_analysis_column
        }));
      } catch (err) {
        console.error("Exception fetching DNA books:", err);
        return [];
      }
    },
    enabled: !!assessmentId,
  });

  // Query for custom shelf books
  const { data: customShelfBooks, isLoading: isLoadingShelfBooks } = useQuery({
    queryKey: ["custom-shelf-books", shelfFilter, user?.id],
    queryFn: async () => {
      if (!user?.id || shelfFilter === "all" || shelfFilter === "dna") return [];

      try {
        console.log(`Fetching book IDs for custom shelf: ${shelfFilter} and user: ${user.id}`);
        
        const { data: shelfBooksData, error: shelfBooksError } = await supabaseAny
          .from("user_shelf_books")
          .select("book_id")
          .eq("shelf_id", shelfFilter)
          .eq("user_id", user.id);
        
        if (shelfBooksError) {
          console.error("Error fetching user_shelf_books:", shelfBooksError);
          return [];
        }
        
        if (!shelfBooksData?.length) {
          console.log("No book IDs found for this custom shelf");
          return [];
        }
        
        // Return just the array of book_ids
        return shelfBooksData;
      } catch (err) {
        console.error("Exception fetching shelf books:", err);
        return [];
      }
    },
    enabled: !!user?.id && shelfFilter !== "all" && shelfFilter !== "dna",
  });

  // Now get the book data for all collected IDs
  const { data: books, isLoading: isLoadingBookDetails } = useQuery({
    queryKey: ["book-details", 
      userBooks ? userBooks.map(b => b.book_id).join(',') : '',
      dnaBooks ? dnaBooks.map(b => b.book_id).join(',') : '',
      customShelfBooks ? customShelfBooks.map(b => b.book_id).join(',') : '',
      shelfFilter
    ],
    queryFn: async () => {
      console.log(`[book-details query] Running for shelfFilter: ${shelfFilter}`);
      // Determine which book IDs to fetch based on the filter
      let bookIds: string[] = [];
      
      if (shelfFilter === "all" && userBooks) {
        // All books - include everything from user_books
        bookIds = userBooks.map(ub => ub.book_id);
      } else if (shelfFilter === "dna" && dnaBooks) {
        // DNA shelf - only include DNA books
        bookIds = dnaBooks.map(db => db.book_id);
      } else if (shelfFilter !== "all" && shelfFilter !== "dna" && customShelfBooks) {
        // Custom shelf - only include books from that shelf
        console.log("[book-details query] Using customShelfBooks:", customShelfBooks);
        bookIds = customShelfBooks.map(sb => sb.book_id);
      }
      
      console.log(`[book-details query] Determined bookIds:`, bookIds);
      
      if (bookIds.length === 0) {
        console.log("[book-details query] No book IDs found, returning empty array.");
        return [];
      }
      
      try {
        console.log(`Fetching details for ${bookIds.length} books`);
        
        const { data: booksData, error: booksError } = await supabaseAny
          .from("books")
          .select("id, title, author, cover_url, slug, epub_file_url")
          .in("id", bookIds);
          
        if (booksError) {
          console.error("[book-details query] Error fetching book details:", booksError);
          return [];
        }
        
        console.log("[book-details query] Fetched booksData:", booksData);
        
        // Filter out books without epub_file_url
        const validBooksData = booksData?.filter(book => !!book.epub_file_url) || [];
        console.log(`Filtered out ${(booksData?.length || 0) - validBooksData.length} books without epub_file_url`);
        
        // Combine with metadata from appropriate source based on filter
        const finalBooksData = validBooksData.map(book => {
          // Find user book data (reading progress, etc) if available
          const userBook = userBooks?.find(ub => ub.book_id === book.id);
          
          // Determine if it's a DNA book
          const dnaBook = dnaBooks?.find(db => db.book_id === book.id);
          
          return {
            ...book,
            last_read_at: userBook?.last_read_at,
            current_page: userBook?.current_page,
            status: userBook?.status,
            isDnaBook: !!dnaBook,
            dna_analysis_column: dnaBook?.dna_analysis_column,
            source: dnaBook ? 'dna' : 'user_books'
          };
        });
        
        console.log("[book-details query] Returning final combined book data:", finalBooksData);
        return finalBooksData;
      } catch (err) {
        console.error("[book-details query] Exception fetching book details:", err);
        return [];
      }
    },
    enabled: true,
  });

  // Add DNA books to user_books to ensure they show up in ALL BOOKS
  // Only run once per assessment, not on every reload
  useEffect(() => {
    const addDnaBooksToUserBooks = async () => {
      if (!user?.id || !dnaBooks?.length || dnaBooksProcessed) return;
      
      try {
        console.log("Adding DNA books to user_books table - one-time operation");
        
        // Process DNA books one by one instead of batch upsert
        for (const dnaBook of dnaBooks) {
          try {
            // First check if the book already exists for this user
            const { data: existingBook } = await supabaseAny
              .from('user_books')
              .select('*')
              .eq('user_id', user.id)
              .eq('book_id', dnaBook.book_id)
              .maybeSingle();
              
            if (existingBook) {
              console.log(`Book ${dnaBook.book_id} already exists for user, skipping`);
              continue;
            }
            
            // Insert the book if it doesn't exist - use 'reading' status instead of 'recommended'
            // to comply with the user_books_status_check constraint
            const { error: insertError } = await supabaseAny
              .from('user_books')
              .insert({
                user_id: user.id,
                book_id: dnaBook.book_id,
                status: 'reading', // Changed from 'recommended' to match allowed values
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error(`Error adding DNA book ${dnaBook.book_id} to user_books:`, insertError);
            }
          } catch (bookErr) {
            console.error(`Error processing DNA book ${dnaBook.book_id}:`, bookErr);
          }
        }
        
        // Mark as processed so we don't run this again
        setDnaBooksProcessed(true);
      } catch (err) {
        console.error("Error adding DNA books to user_books:", err);
      }
    };
    
    addDnaBooksToUserBooks();
  }, [user?.id, dnaBooks, dnaBooksProcessed]);

  const isLoading = isLoadingUserBooks || isLoadingDnaBooks || 
                   isLoadingShelfBooks || isLoadingBookDetails;

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[#E9E7E2]/60">No books found in this shelf</p>
        {shelfFilter === "dna" ? (
          <p className="text-[#E9E7E2]/60 mt-2">Visit your DNA results to get matched with books</p>
        ) : (
          <p className="text-[#E9E7E2]/60 mt-2">Start reading or add books to see them here</p>
        )}
      </div>
    );
  }

  // Set options for better mobile display
  const carouselOptions = {
    align: "start" as const,
    loop: false,
    dragFree: true
  };

  return (
    <Carousel 
      opts={carouselOptions} 
      className="w-full pb-10 overflow-visible"
    >
      <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
        {books
          .filter(book => !!book.epub_file_url) // Filter out books without epub_file_url
          .map((book) => (
          <CarouselItem 
            key={book.id} 
            className="pl-2 md:pl-4 basis-[57%] md:basis-1/4 lg:basis-1/5"
          >
            <BookCard
              id={book.id}
              title={book.title || "Unknown Title"}
              author={book.author || "Unknown Author"}
              cover_url={book.cover_url}
              slug={book.slug}
              epub_file_url={book.epub_file_url}
              isDnaBook={book.isDnaBook}
              dna_analysis_column={book.dna_analysis_column}
              userId={userId}
              customShelves={customShelves}
              onRemoveBookFromLibrary={onRemoveBookFromLibrary}
              onAddBookToShelf={onAddBookToShelf}
              onRemoveBookFromShelf={onRemoveBookFromShelf}
              shelfFilter={shelfFilter}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-2" />
      <CarouselNext className="hidden md:flex -right-2" />
    </Carousel>
  );
};

export default CarouselBooksContent;
