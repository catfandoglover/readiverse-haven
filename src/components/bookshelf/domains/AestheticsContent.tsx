import React from "react";
import BookshelfCarousel from "../BookshelfCarousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const AestheticsContent: React.FC = () => {
  return <BookshelfCarousel queryKey="aesthetics-books" />;
};

export default AestheticsContent;
