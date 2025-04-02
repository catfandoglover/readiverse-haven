import React from "react";
import BookshelfCarousel from "../BookshelfCarousel";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const OntologyContent: React.FC = () => {
  return <BookshelfCarousel queryKey="ontology-books" />;
};

export default OntologyContent;
