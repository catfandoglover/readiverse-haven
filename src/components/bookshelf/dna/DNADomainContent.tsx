import React from "react";
import DNABookshelfCarousel from "./DNABookshelfCarousel";

interface DNADomainContentProps {
  domain: "ethics" | "epistemology" | "politics" | "theology" | "ontology" | "aesthetics";
}

/**
 * A single component to handle all domain content in the Intellectual DNA Shelf
 * This reduces code duplication and improves maintainability.
 */
const DNADomainContent: React.FC<DNADomainContentProps> = ({ domain }) => {
  return <DNABookshelfCarousel domain={domain} />;
};

export default DNADomainContent;
