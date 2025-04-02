import React from "react";
import BookshelfCarousel from "../BookshelfCarousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const TheologyContent: React.FC = () => {
  return <BookshelfCarousel queryKey="theology-books" />;
};

export default TheologyContent;
