import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "../BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useProfileData } from "@/contexts/ProfileDataContext";

// Type assertion to silence TypeScript errors
const supabaseAny = supabase as any;

// Known valid assessment ID for testing
const KNOWN_ASSESSMENT_ID = "d47fbbf4-b692-451e-b3d7-7eb1e73522b4";

interface DNABookshelfCarouselProps {
  domain: string;
  books?: any[];
  isLoading?: boolean;
}

const DNABookshelfCarousel: React.FC<DNABookshelfCarouselProps> = ({ 
  domain, 
  books: providedBooks,
  isLoading: providedLoading
}) => {
  const { user } = useAuth();
  const { dnaAnalysisData, isLoading: profileLoading, debugInfo } = useProfileData();
  
  // Add detailed debug logging at component mount
  React.useEffect(() => {
    console.log(`[DNA SHELF DEBUG] Mounted DNABookshelfCarousel for domain: ${domain}`);
    console.log(`[DNA SHELF DEBUG] User:`, user?.id ? `ID: ${user.id}` : 'Not logged in');
    console.log(`[DNA SHELF DEBUG] DNA Analysis Data:`, dnaAnalysisData 
      ? `ID: ${dnaAnalysisData.id}, Assessment ID: ${dnaAnalysisData.assessment_id}` 
      : 'Not available');
    console.log(`[DNA SHELF DEBUG] Profile Debug Info:`, debugInfo);
    
    // First, check the table structure to see what columns actually exist
    async function checkTableColumns() {
      try {
        // First get one record to see what columns exist
        const { data: sampleData, error: sampleError } = await supabaseAny
          .from("dna_analysis_results_matched")
          .select("*")
          .limit(1);
          
        if (sampleError) {
          console.error(`[DNA SHELF DEBUG] Error fetching sample:`, sampleError);
        } else {
          console.log(`[DNA SHELF DEBUG] Table columns:`, sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : 'No data');
        }
      } catch (err) {
        console.error(`[DNA SHELF DEBUG] Error checking table structure:`, err);
      }
    }
    
    // Direct check for known assessment ID
    async function checkKnownAssessment() {
      try {
        await checkTableColumns();
        
        console.log(`[DNA SHELF DEBUG] Checking for data on known assessment ID: ${KNOWN_ASSESSMENT_ID}`);
        // Use dna_analysis_column instead of field_name based on the error
        const { data: matchedResults, error: matchError } = await supabaseAny
          .from("dna_analysis_results_matched")
          .select("dna_analysis_column, matched_id")
          .eq("assessment_id", KNOWN_ASSESSMENT_ID)
          .like("dna_analysis_column", `${domain}_%_classic`);
          
        if (matchError) {
          console.error(`[DNA SHELF DEBUG] Error checking known assessment:`, matchError);
        } else {
          console.log(`[DNA SHELF DEBUG] Known assessment check: found ${matchedResults?.length || 0} matches for domain ${domain}`);
          console.log(`[DNA SHELF DEBUG] Known assessment sample matches:`, matchedResults?.slice(0, 5));
          
          if (matchedResults?.length) {
            // Try to fetch one book as a test
            const testBookId = matchedResults[0].matched_id;
            const { data: bookData, error: bookError } = await supabaseAny
              .from("books")
              .select("id, title, author")
              .eq("id", testBookId)
              .maybeSingle();
              
            console.log(`[DNA SHELF DEBUG] Test book fetch for ${testBookId}:`, bookData || "Not found", bookError || "No error");
          }
        }
      } catch (err) {
        console.error(`[DNA SHELF DEBUG] Error in known assessment check:`, err);
      }
    }
    
    checkKnownAssessment();
  }, [domain, user, dnaAnalysisData, debugInfo]);
  
  const { data: fetchedBooks, isLoading: fetchLoading } = useQuery({
    queryKey: [`dna-books-${domain}`, user?.id, dnaAnalysisData?.assessment_id],
    queryFn: async () => {
      // For testing purposes, use the known assessment ID directly
      const assessmentId = dnaAnalysisData?.assessment_id || KNOWN_ASSESSMENT_ID;
      
      if (!user?.id) {
        console.log(`[DNA SHELF DEBUG] Skipping book fetch - missing user ID`);
        console.log(`[DNA SHELF DEBUG] User ID: ${user?.id}, Using assessment ID: ${assessmentId}`);
        return [];
      }

      try {
        console.log(`[DNA SHELF DEBUG] Fetching DNA books for:
          - User ID: ${user.id}
          - Domain: ${domain}
          - Assessment ID: ${assessmentId}
        `);
        
        // Get all matches for this domain with "classic" suffix in dna_analysis_column
        console.log(`[DNA SHELF DEBUG] Querying dna_analysis_results_matched for pattern: ${domain}_%_classic`);
        const { data: matchedResults, error: matchError } = await supabaseAny
          .from("dna_analysis_results_matched")
          .select("matched_id, dna_analysis_column")
          .eq("assessment_id", assessmentId)
          .like("dna_analysis_column", `${domain}_%_classic`);
        
        if (matchError) {
          console.error(`[DNA SHELF DEBUG] Error fetching matched results:`, matchError);
          return [];
        }
        
        console.log(`[DNA SHELF DEBUG] Matched results:`, matchedResults);
        
        if (!matchedResults?.length) {
          console.log(`[DNA SHELF DEBUG] No matched books found for domain ${domain}`);
          
          // Debugging: Check if there are ANY entries for this assessment_id
          const { data: anyMatches, error: anyMatchError } = await supabaseAny
            .from("dna_analysis_results_matched")
            .select("dna_analysis_column")
            .eq("assessment_id", assessmentId);
            
          if (anyMatchError) {
            console.error(`[DNA SHELF DEBUG] Error checking any matches:`, anyMatchError);
          } else {
            console.log(`[DNA SHELF DEBUG] Found ${anyMatches?.length || 0} total matches for assessment ID ${assessmentId}`);
            console.log(`[DNA SHELF DEBUG] Sample matches:`, anyMatches?.slice(0, 5) || []);
          }
          
          return [];
        }
        
        // Extract the matched IDs (which should be book UUIDs)
        const bookIds = matchedResults.map(match => match.matched_id);
        console.log(`[DNA SHELF DEBUG] Book IDs to fetch:`, bookIds);
        
        // Then fetch the book details for each matched ID
        const { data: booksData, error: booksError } = await supabaseAny
          .from("books")
          .select("id, title, author, cover_url, slug, epub_file_url")
          .in("id", bookIds);
          
        if (booksError) {
          console.error(`[DNA SHELF DEBUG] Error fetching books:`, booksError);
          return [];
        }
        
        console.log(`[DNA SHELF DEBUG] Books fetched:`, booksData);
        
        // Combine the data to include field names
        const result = matchedResults.map(match => {
          const bookData = booksData?.find(b => b.id === match.matched_id);
          // Extract the thinker name from the field name (e.g., ethics_kindred_spirit_1_classic)
          const fieldParts = match.dna_analysis_column.split('_');
          const position = fieldParts.findIndex(part => part === 'classic') - 1;
          const type = position > 0 ? `${fieldParts[position-1]}_${fieldParts[position]}` : "resource";
          
          return {
            ...match,
            ...bookData,
            type,
            isDnaBook: true,
            dna_analysis_column: match.dna_analysis_column
          };
        });
        
        console.log(`[DNA SHELF DEBUG] Final result with ${result.length} books:`, result);
        return result;
      } catch (err) {
        console.error(`[DNA SHELF DEBUG] Exception fetching DNA books:`, err);
        return [];
      }
    },
    enabled: true, // Always enable the query for testing
  });

  const books = providedBooks || fetchedBooks;
  const isLoading = providedLoading || fetchLoading || profileLoading;

  // Log when loading state changes or books are updated
  React.useEffect(() => {
    console.log(`[DNA SHELF DEBUG] Loading state: ${isLoading}`);
    console.log(`[DNA SHELF DEBUG] Books data:`, books);
  }, [isLoading, books]);

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Fallback books if none found
  const fallbackBooks = [
    {
      id: "1",
      title: "Sample Book 1",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "2",
      title: "Sample Book 2",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
    {
      id: "3",
      title: "Sample Book 3",
      author: "Author Name",
      cover_url: "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png",
    },
  ];

  // Use books from database if available, otherwise use fallback
  const displayBooks = books?.length ? books : fallbackBooks;
  console.log(`[DNA SHELF DEBUG] Using ${books?.length ? 'fetched' : 'fallback'} books`, displayBooks);

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
        {displayBooks.map((book) => (
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
              isDnaBook={true}
              dna_analysis_column={book.dna_analysis_column}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-2" />
      <CarouselNext className="hidden md:flex -right-2" />
    </Carousel>
  );
};

export default DNABookshelfCarousel;
