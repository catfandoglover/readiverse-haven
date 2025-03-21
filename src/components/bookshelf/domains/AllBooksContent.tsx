import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AllBooksContent: React.FC = () => {
  const { user } = useAuth();

  const { data: books, isLoading } = useQuery({
    queryKey: ["all-user-books", user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid) return [];

      try {
        console.log("Fetching books for user:", user.Account.Uid);
        
        // Try direct query first to see if user_books entries exist
        const { data: userBooks, error: userBooksError } = await supabase
          .from("user_books")
          .select("*")
          .eq("outseta_user_id", user.Account.Uid);
        
        console.log("Raw user_books data:", userBooks, "Error:", userBooksError);
        
        // Now try different approaches for the join
        
        // Approach 1: Explicitly name the relationship
        const { data: approach1Data, error: approach1Error } = await supabase
          .from("user_books")
          .select("*, book:books!user_books_book_id_fkey(id, title, author, cover_url)")
          .eq("outseta_user_id", user.Account.Uid);

        console.log("Approach 1 (named relationship):", approach1Data, "Error:", approach1Error);
        
        // Approach 2: Try a different relationship
        const { data: approach2Data, error: approach2Error } = await supabase
          .from("user_books")
          .select("*, book:books!fk_user_books_book(id, title, author, cover_url)")
          .eq("outseta_user_id", user.Account.Uid);

        console.log("Approach 2 (alternative relationship):", approach2Data, "Error:", approach2Error);
        
        // Approach 3: Manual join
        const { data: approach3Data, error: approach3Error } = await supabase
          .from("user_books")
          .select("*")
          .eq("outseta_user_id", user.Account.Uid);
          
        console.log("Approach 3 (manual pre-join):", approach3Data, "Error:", approach3Error);
        
        // If we got data from approach 3, fetch the books manually
        let finalData = [];
        if (approach3Data && approach3Data.length > 0) {
          console.log("Trying manual join with book IDs");
          const bookIds = approach3Data.map(ub => ub.book_id);
          
          const { data: booksData, error: booksError } = await supabase
            .from("books")
            .select("id, title, author, cover_url")
            .in("id", bookIds);
            
          console.log("Manual books fetch:", booksData, "Error:", booksError);
          
          if (booksData) {
            // Combine the data
            finalData = approach3Data.map(ub => {
              const bookData = booksData.find(b => b.id === ub.book_id);
              return {
                ...ub,
                book: bookData
              };
            });
            console.log("Final manual joined data:", finalData);
          }
        }
        
        // Return the best data we have
        if (finalData.length > 0) {
          return finalData;
        }
        if (approach1Data && approach1Data.length > 0) {
          return approach1Data;
        }
        if (approach2Data && approach2Data.length > 0) {
          return approach2Data;
        }
        
        // If all approaches failed but we have user books without joins, return those
        if (approach3Data && approach3Data.length > 0) {
          return approach3Data.map(ub => ({
            ...ub,
            book: { id: ub.book_id, title: "Unknown Book", author: "Unknown Author" }
          }));
        }
        
        return [];
      } catch (err) {
        console.error("Exception fetching all books:", err);
        return [];
      }
    },
    enabled: !!user?.Account?.Uid,
  });

  console.log("Component books data:", books);

  if (isLoading) {
    console.log("Books loading...");
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    console.log("No books found condition triggered");
    return (
      <div className="text-center py-10">
        <p className="text-[#2A282A]/60">No books found in your library</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((userBook) => {
        console.log("Rendering book:", userBook);
        const book = userBook.book;
        
        // Add debugging for the book object itself
        console.log("Book object:", book);
        
        // Make sure the book cover URL is correct or use fallback
        const coverUrl = book?.cover_url || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
        console.log("Using cover URL:", coverUrl);
        
        return (
          <div key={userBook.id} className="w-full cursor-pointer group">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
              <img
                src={coverUrl}
                alt={book?.title || "Book cover"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.log("Image failed to load:", coverUrl);
                  e.currentTarget.src = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
                }}
              />
              {/* Add title overlay for visibility */}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold truncate">{book?.title || "Unknown Title"}</h3>
                <p className="text-white/80 text-sm truncate">{book?.author || "Unknown Author"}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllBooksContent;
