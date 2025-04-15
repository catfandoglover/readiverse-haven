import React, { useState } from "react";
import CarouselBooksContent from "./domains/CarouselBooksContent";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Type assertion to silence TypeScript errors
const supabaseAny = supabase as any;

interface Shelf {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

const BookshelfContent: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeShelf, setActiveShelf] = useState<string>("all");
  const [newShelfName, setNewShelfName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query to fetch user's custom shelves
  const { data: customShelves = [], refetch: refetchShelves } = useQuery({
    queryKey: ["user-shelves", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabaseAny
        .from("user_shelves")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shelves:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Renamed for clarity: Removes book from the main user_books table
  const handleRemoveBookFromLibrary = async (bookId: string) => {
    if (!user?.id) return;
    try {
      console.log(`Removing book ${bookId} for user ${user.id}`);
      const { error } = await supabase
        .from("user_books")
        .delete()
        .match({ user_id: user.id, book_id: bookId });

      if (error) throw error;

      toast({ title: "Book removed", description: "Successfully removed from your bookshelf." });
      // Invalidate the source list of user books, which will trigger dependent queries
      console.log(`Invalidating user book list query...`);
      queryClient.invalidateQueries({ queryKey: ['all-user-books', user.id] });
      // Optionally, could also invalidate the specific shelf if needed, but invalidating the source list is often enough
      // queryClient.invalidateQueries({ queryKey: ['custom-shelf-books', activeShelf, user.id] });
    } catch (error: any) {
      console.error("Error removing book:", error);
      toast({ title: "Error", description: `Could not remove book: ${error.message}`, variant: "destructive" });
    }
  };

  // New handler: Removes book from the *currently viewed custom shelf*
  const handleRemoveBookFromShelf = async (bookId: string) => {
    // Only proceed if a custom shelf is active
    if (!user?.id || activeShelf === "all" || activeShelf === "dna") return; 
    
    const shelfId = activeShelf; // The current custom shelf
    
    try {
      console.log(`Removing book ${bookId} from shelf ${shelfId} for user ${user.id}`);
      const { error } = await supabase
        .from("user_shelf_books")
        .delete()
        .match({ user_id: user.id, shelf_id: shelfId, book_id: bookId });

      if (error) throw error;

      toast({ title: "Book removed from shelf", description: "Successfully removed from this shelf." });
      // Invalidate the query for the specific custom shelf to refresh its book list
      console.log(`Invalidating query for custom shelf: ${shelfId}`);
      queryClient.invalidateQueries({ queryKey: ['custom-shelf-books', shelfId, user.id] });
    } catch (error: any) {
      console.error(`Error removing book from shelf ${shelfId}:`, error);
      toast({ title: "Error", description: `Could not remove book from shelf: ${error.message}`, variant: "destructive" });
    }
  };

  // Define handleAddBookToShelf here
  const handleAddBookToShelf = async (bookId: string, shelfId: string) => {
    if (!user?.id) return;
    try {
      console.log(`Adding book ${bookId} to shelf ${shelfId} for user ${user.id}`);
      const { data: existing, error: checkError } = await supabase
        .from('user_shelf_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('shelf_id', shelfId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        toast({ title: "Already added", description: "This book is already on that shelf." });
        return;
      }

      const { error: insertError } = await supabase
        .from("user_shelf_books")
        .insert({ user_id: user.id, shelf_id: shelfId, book_id: bookId });

      if (insertError) throw insertError;

      toast({ title: "Book added", description: "Successfully added to the shelf." });
      // Invalidate the query for the specific custom shelf to refresh its book list
      console.log(`Invalidating query for custom shelf: ${shelfId}`);
      queryClient.invalidateQueries({ queryKey: ['custom-shelf-books', shelfId, user.id] });
      // The book-details query depends on this, so it should refetch automatically
    } catch (error: any) {
      console.error("Error adding book to shelf:", error);
      toast({ title: "Error", description: `Could not add book to shelf: ${error.message}`, variant: "destructive" });
    }
  };

  // Create a new shelf
  const handleCreateShelf = async () => {
    if (!user?.id || !newShelfName.trim()) return;

    try {
      console.log(`Attempting to create shelf: '${newShelfName.trim()}' for user: ${user.id}`); // Log input
      const { data, error } = await supabaseAny
        .from("user_shelves")
        .insert([
          {
            name: newShelfName.trim(),
            user_id: user.id,
          },
        ])
        
      // Log the direct result from Supabase
      console.log("Supabase insert result:", { data, error });

      if (error) {
        console.error("Error creating shelf (Supabase error object):", error);
        // Optionally, display a user-friendly message using toast
        // toast({ title: "Error", description: `Could not create shelf: ${error.message}`, variant: "destructive" });
        return;
      }

      console.log("Shelf created successfully, data:", data); // Log success data

      // Close dialog and reset input
      setNewShelfName("");
      setIsDialogOpen(false);
      
      // Refetch shelves and switch to the new shelf
      refetchShelves().then(() => {
        if (data) {
          setActiveShelf(data.id);
        }
      });
    } catch (err) {
      // Improved error logging
      console.error("Detailed error creating shelf:", JSON.stringify(err, null, 2));
      // Optionally, display a user-friendly message
      // toast({ title: "Error", description: "Could not create shelf. Please try again.", variant: "destructive" });
    }
  };

  // Get the current active shelf name
  const getActiveShelfName = () => {
    if (activeShelf === "all") return "ALL BOOKS";
    if (activeShelf === "dna") return "DNA SHELF";
    
    const shelf = customShelves.find(s => s.id === activeShelf);
    return shelf?.name?.toUpperCase() || "ALL BOOKS";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with filter dropdown */}
      <div className="mb-6">
        <div className="h-px w-full my-6 bg-[#9F9EA1]/20"></div>
        <div className="flex justify-between items-center px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 font-oxanium text-base font-bold text-[#E9E7E2] uppercase tracking-wider focus:outline-none">
                <span>{getActiveShelfName()}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#3F3A46] text-[#E9E7E2] border-[#4E4955]">
              <DropdownMenuItem 
                className={`font-oxanium uppercase text-xs tracking-wider cursor-pointer ${activeShelf === "all" ? "text-[#E9E7E2] bg-[#4E4955]" : "text-[#E9E7E2]/80"} focus:bg-transparent focus:text-[#E9E7E2]`}
                onClick={() => setActiveShelf("all")}
              >
                ALL BOOKS
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`font-oxanium uppercase text-xs tracking-wider cursor-pointer ${activeShelf === "dna" ? "text-[#E9E7E2] bg-[#4E4955]" : "text-[#E9E7E2]/80"} focus:bg-transparent focus:text-[#E9E7E2]`}
                onClick={() => setActiveShelf("dna")}
              >
                DNA SHELF
              </DropdownMenuItem>
              
              {customShelves.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-[#4E4955]/50" />
                  {customShelves.map((shelf) => (
                    <DropdownMenuItem 
                      key={shelf.id}
                      className={`font-oxanium uppercase text-xs tracking-wider cursor-pointer ${activeShelf === shelf.id ? "text-[#E9E7E2] bg-[#4E4955]" : "text-[#E9E7E2]/80"} focus:bg-transparent focus:text-[#E9E7E2]`}
                      onClick={() => setActiveShelf(shelf.id)}
                    >
                      {shelf.name.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              <DropdownMenuSeparator className="bg-[#4E4955]/50" />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem 
                    className="font-oxanium uppercase text-xs tracking-wider cursor-pointer text-[#E9E7E2]/80 focus:bg-transparent focus:text-[#E9E7E2]" 
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Plus className="h-4 w-4 mr-2" /> 
                    CREATE NEW SHELF
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="bg-[#3F3A46] text-[#E9E7E2] border border-[#9F9EA1] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-[#E9E7E2] font-oxanium uppercase tracking-wider">CREATE NEW SHELF</DialogTitle>
                    <DialogDescription className="text-[#E9E7E2]/70">
                      Enter a name for your new bookshelf.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    placeholder="Shelf name"
                    className="bg-[#332E38] border border-[#9F9EA1] text-[#E9E7E2] rounded-2xl placeholder:font-oxanium placeholder:uppercase placeholder:text-[#E9E7E2]/50"
                  />
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateShelf}
                      className="bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 font-oxanium uppercase tracking-wider rounded-2xl"
                    >
                      CREATE SHELF
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Better overflow handling for mobile */}
      <div className="flex-1 overflow-visible">
        {/* Remove @ts-ignore and pass necessary props */}
        <CarouselBooksContent 
          shelfFilter={activeShelf} 
          userId={user?.id} // Pass userId (optional chaining still okay here for initial render)
          customShelves={customShelves} 
          onRemoveBookFromLibrary={handleRemoveBookFromLibrary} // Renamed prop
          onAddBookToShelf={handleAddBookToShelf}
          // Pass the new handler only if a custom shelf is active
          onRemoveBookFromShelf={activeShelf !== 'all' && activeShelf !== 'dna' ? handleRemoveBookFromShelf : undefined}
        />
      </div>
    </div>
  );
};

export default BookshelfContent;
