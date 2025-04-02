import React from "react";
import BookshelfCarousel from "../BookshelfCarousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const PoliticsContent: React.FC = () => {
  return <BookshelfCarousel queryKey="politics-books" />;
};

export default PoliticsContent;
