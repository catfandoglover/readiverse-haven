import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Database } from "@/integrations/supabase/types";
import { Compass, LibraryBig, Search, Grid, List } from "lucide-react";
import { Toggle } from "./ui/toggle";
import QuestionsCards from "./QuestionsCards";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme/ThemeToggle";

type Book = Database['public']['Tables']['books']['Row'];

const Home = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const { data: books = [] } = useQuery<Book[]>(['books'], async () => {
    const { data } = await supabase.from('books').select('*');
    return data;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">My Library</h1>
        <ThemeToggle />
        <Toggle
          pressed={view === 'grid'}
          onPressedChange={() => setView(view === 'grid' ? 'list' : 'grid')}
        >
          {view === 'grid' ? <Grid className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </Toggle>
      </div>
      <div className={`grid ${view === 'grid' ? 'grid-cols-3' : 'grid-cols-1'} gap-4 p-4`}>
        {books.map((book) => (
          <Card key={book.id} onClick={() => navigate(`/reader/${book.id}`)}>
            <h2 className="text-lg font-semibold">{book.title}</h2>
            <p className="text-sm text-gray-500">{book.author}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
