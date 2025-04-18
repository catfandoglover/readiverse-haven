import React from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import BookCard from "../BookCard";

interface CustomDomainContentProps {
  domainId: string;
  domainName: string;
}

interface BookData {
  id: string;
  title: string;
  author: string;
  cover_url: string;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters long",
  }),
  author: z.string().min(2, {
    message: "Author must be at least 2 characters long",
  }),
  coverUrl: z.string().url({
    message: "Please enter a valid URL for the cover image",
  }),
});

type BookFormValues = z.infer<typeof formSchema>;

const CustomDomainContent: React.FC<CustomDomainContentProps> = ({ domainId, domainName }) => {
  const { user } = useAuth();
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      coverUrl: "",
    },
  });

  const { data: books, refetch } = useQuery({
    queryKey: ["custom-domain-books", domainId],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("custom_domain_books")
          .select("id, title, author, cover_url")
          .eq("domain_id", domainId);
        
        if (error) {
          console.error("Error fetching domain books:", error);
          return [];
        }
        
        return (data || []) as BookData[];
      } catch (error) {
        console.error("Exception fetching domain books:", error);
        return [];
      }
    },
    enabled: !!user && !!domainId,
  });

  const onSubmit = async (values: BookFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add a book");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = user.id;
      
      const { error } = await supabase
        .from("custom_domain_books")
        .insert({
          domain_id: domainId,
          title: values.title,
          author: values.author,
          cover_url: values.coverUrl,
          user_id: userId,
        });

      if (error) {
        console.error("Error adding book:", error);
        toast.error("Failed to add book");
        return;
      }

      toast.success("Book added successfully");
      refetch();
      setIsAddBookDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{domainName}</h3>
        <Button 
          onClick={() => setIsAddBookDialogOpen(true)} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {(!books || books.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          <p>No books added to this domain yet.</p>
          <p>Click "Add Book" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              cover_url={book.cover_url}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="add-book-dialog-description">
          <DialogHeader>
            <DialogTitle>Add Book to {domainName}</DialogTitle>
          </DialogHeader>
          <div id="add-book-dialog-description" className="sr-only">
            Form to add a new book to {domainName}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cover image URL..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddBookDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Book"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomDomainContent;
