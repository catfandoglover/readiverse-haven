import React, { useState } from "react";
import CarouselBooksContent from "./domains/CarouselBooksContent";
import { ChevronDown, Plus } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

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

  // Create a new shelf
  const handleCreateShelf = async () => {
    if (!user?.id || !newShelfName.trim()) return;

    try {
      const { data, error } = await supabaseAny
        .from("user_shelves")
        .insert([
          {
            name: newShelfName.trim(),
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating shelf:", error);
        return;
      }

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
      console.error("Error creating shelf:", err);
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
                <DialogContent className="bg-[#3F3A46] text-[#E9E7E2] border-[#4E4955]">
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
                    className="bg-[#332E38] border-[#4E4955] text-[#E9E7E2]"
                  />
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateShelf}
                      className="bg-[#7E69AB] text-[#E9E7E2] hover:bg-[#9b87f5] font-oxanium uppercase tracking-wider"
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
        {/* @ts-ignore - CarouselBooksContent will be updated to accept shelfFilter */}
        <CarouselBooksContent shelfFilter={activeShelf} />
      </div>
    </div>
  );
};

export default BookshelfContent;
