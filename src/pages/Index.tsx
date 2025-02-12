
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: books, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const addToBookshelf = useMutation({
    mutationFn: async (bookId: string) => {
      if (!user) {
        throw new Error('You must be logged in to add books to your bookshelf');
      }

      const { error } = await supabase
        .from('user_books')
        .insert({
          book_id: bookId,
          outseta_user_id: user.accountUid,
          status: 'reading',
          current_page: 0
        });

      if (error && error.code !== '23505') { // Ignore unique violation errors
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        description: "Book added to your bookshelf",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to add book to bookshelf",
      });
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books?.map((book) => (
          <div key={book.id} className="bg-card rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-[3/4]">
              <img
                src={book.cover_url || '/placeholder.svg'}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
              {book.author && (
                <p className="text-muted-foreground text-sm mb-4">{book.author}</p>
              )}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/${book.slug}`}
                >
                  Read
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addToBookshelf.mutate(book.id)}
                  disabled={addToBookshelf.isPending}
                >
                  {addToBookshelf.isPending ? "Adding..." : "Add to Bookshelf"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
