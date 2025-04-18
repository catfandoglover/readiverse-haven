import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import PersonCard from "./PersonCard";
import PersonDetailsDialog from "./PersonDetailsDialog";
import { useProfileData } from "@/contexts/ProfileDataContext";

interface Person {
  name: string;
  classic: string;
  rationale: string;
  domain: string;
  type: "KINDRED SPIRIT" | "CHALLENGING VOICE";
  imageUrl: string;
  iconUrl?: string; 
  isMost?: boolean;
  useIconFallback?: boolean;
}

type PersonType = "KINDRED SPIRIT" | "CHALLENGING VOICE";

interface OrderedField {
  field: string;
  domain: string;
  type: PersonType;
  isMost?: boolean;
}

// Define the exact order for displaying items outside the component to prevent recreation on every render
const orderedFields: OrderedField[] = [
  { field: "most_kindred_spirit", domain: "highlight", type: "KINDRED SPIRIT", isMost: true },
  { field: "most_challenging_voice", domain: "highlight", type: "CHALLENGING VOICE", isMost: true },
  
  // Ethics domain pairs
  { field: "ethics_kindred_spirit_1", domain: "ethics", type: "KINDRED SPIRIT" },
  { field: "ethics_challenging_voice_1", domain: "ethics", type: "CHALLENGING VOICE" },
  { field: "ethics_kindred_spirit_2", domain: "ethics", type: "KINDRED SPIRIT" },
  { field: "ethics_challenging_voice_2", domain: "ethics", type: "CHALLENGING VOICE" },
  { field: "ethics_kindred_spirit_3", domain: "ethics", type: "KINDRED SPIRIT" },
  { field: "ethics_challenging_voice_3", domain: "ethics", type: "CHALLENGING VOICE" },
  { field: "ethics_kindred_spirit_4", domain: "ethics", type: "KINDRED SPIRIT" },
  { field: "ethics_challenging_voice_4", domain: "ethics", type: "CHALLENGING VOICE" },
  { field: "ethics_kindred_spirit_5", domain: "ethics", type: "KINDRED SPIRIT" },
  { field: "ethics_challenging_voice_5", domain: "ethics", type: "CHALLENGING VOICE" },
  
  // Epistemology domain pairs
  { field: "epistemology_kindred_spirit_1", domain: "epistemology", type: "KINDRED SPIRIT" },
  { field: "epistemology_challenging_voice_1", domain: "epistemology", type: "CHALLENGING VOICE" },
  { field: "epistemology_kindred_spirit_2", domain: "epistemology", type: "KINDRED SPIRIT" },
  { field: "epistemology_challenging_voice_2", domain: "epistemology", type: "CHALLENGING VOICE" },
  { field: "epistemology_kindred_spirit_3", domain: "epistemology", type: "KINDRED SPIRIT" },
  { field: "epistemology_challenging_voice_3", domain: "epistemology", type: "CHALLENGING VOICE" },
  { field: "epistemology_kindred_spirit_4", domain: "epistemology", type: "KINDRED SPIRIT" },
  { field: "epistemology_challenging_voice_4", domain: "epistemology", type: "CHALLENGING VOICE" },
  { field: "epistemology_kindred_spirit_5", domain: "epistemology", type: "KINDRED SPIRIT" },
  { field: "epistemology_challenging_voice_5", domain: "epistemology", type: "CHALLENGING VOICE" },
  
  // Politics domain pairs
  { field: "politics_kindred_spirit_1", domain: "politics", type: "KINDRED SPIRIT" },
  { field: "politics_challenging_voice_1", domain: "politics", type: "CHALLENGING VOICE" },
  { field: "politics_kindred_spirit_2", domain: "politics", type: "KINDRED SPIRIT" },
  { field: "politics_challenging_voice_2", domain: "politics", type: "CHALLENGING VOICE" },
  { field: "politics_kindred_spirit_3", domain: "politics", type: "KINDRED SPIRIT" },
  { field: "politics_challenging_voice_3", domain: "politics", type: "CHALLENGING VOICE" },
  { field: "politics_kindred_spirit_4", domain: "politics", type: "KINDRED SPIRIT" },
  { field: "politics_challenging_voice_4", domain: "politics", type: "CHALLENGING VOICE" },
  { field: "politics_kindred_spirit_5", domain: "politics", type: "KINDRED SPIRIT" },
  { field: "politics_challenging_voice_5", domain: "politics", type: "CHALLENGING VOICE" },
  
  // Theology domain pairs
  { field: "theology_kindred_spirit_1", domain: "theology", type: "KINDRED SPIRIT" },
  { field: "theology_challenging_voice_1", domain: "theology", type: "CHALLENGING VOICE" },
  { field: "theology_kindred_spirit_2", domain: "theology", type: "KINDRED SPIRIT" },
  { field: "theology_challenging_voice_2", domain: "theology", type: "CHALLENGING VOICE" },
  { field: "theology_kindred_spirit_3", domain: "theology", type: "KINDRED SPIRIT" },
  { field: "theology_challenging_voice_3", domain: "theology", type: "CHALLENGING VOICE" },
  { field: "theology_kindred_spirit_4", domain: "theology", type: "KINDRED SPIRIT" },
  { field: "theology_challenging_voice_4", domain: "theology", type: "CHALLENGING VOICE" },
  { field: "theology_kindred_spirit_5", domain: "theology", type: "KINDRED SPIRIT" },
  { field: "theology_challenging_voice_5", domain: "theology", type: "CHALLENGING VOICE" },
  
  // Ontology domain pairs
  { field: "ontology_kindred_spirit_1", domain: "ontology", type: "KINDRED SPIRIT" },
  { field: "ontology_challenging_voice_1", domain: "ontology", type: "CHALLENGING VOICE" },
  { field: "ontology_kindred_spirit_2", domain: "ontology", type: "KINDRED SPIRIT" },
  { field: "ontology_challenging_voice_2", domain: "ontology", type: "CHALLENGING VOICE" },
  { field: "ontology_kindred_spirit_3", domain: "ontology", type: "KINDRED SPIRIT" },
  { field: "ontology_challenging_voice_3", domain: "ontology", type: "CHALLENGING VOICE" },
  { field: "ontology_kindred_spirit_4", domain: "ontology", type: "KINDRED SPIRIT" },
  { field: "ontology_challenging_voice_4", domain: "ontology", type: "CHALLENGING VOICE" },
  { field: "ontology_kindred_spirit_5", domain: "ontology", type: "KINDRED SPIRIT" },
  { field: "ontology_challenging_voice_5", domain: "ontology", type: "CHALLENGING VOICE" },
  
  // Aesthetics domain pairs
  { field: "aesthetics_kindred_spirit_1", domain: "aesthetics", type: "KINDRED SPIRIT" },
  { field: "aesthetics_challenging_voice_1", domain: "aesthetics", type: "CHALLENGING VOICE" },
  { field: "aesthetics_kindred_spirit_2", domain: "aesthetics", type: "KINDRED SPIRIT" },
  { field: "aesthetics_challenging_voice_2", domain: "aesthetics", type: "CHALLENGING VOICE" },
  { field: "aesthetics_kindred_spirit_3", domain: "aesthetics", type: "KINDRED SPIRIT" },
  { field: "aesthetics_challenging_voice_3", domain: "aesthetics", type: "CHALLENGING VOICE" },
  { field: "aesthetics_kindred_spirit_4", domain: "aesthetics", type: "KINDRED SPIRIT" },
  { field: "aesthetics_challenging_voice_4", domain: "aesthetics", type: "CHALLENGING VOICE" },
  { field: "aesthetics_kindred_spirit_5", domain: "aesthetics", type: "KINDRED SPIRIT" },
  { field: "aesthetics_challenging_voice_5", domain: "aesthetics", type: "CHALLENGING VOICE" }
];

// Fallback image URL as a constant
const FALLBACK_IMAGE_URL = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0MjMzMDMwLCJleHAiOjg4MTQ0MTQ2NjMwfQ.rVgAMWNvwuJiEYBf1bUO51iQSH7pcm5YrjMcuJ7BcO8";

const IntellectualCarousel: React.FC = () => {
  const { dnaAnalysisData, isLoading, getIconByName } = useProfileData();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Function to extract and format carousel data from dnaAnalysisData according to specified order
  const carouselData = useMemo(() => {
    if (!dnaAnalysisData || isLoading) return [];

    const people: Person[] = [];

    // Process each field in the specified order
    orderedFields.forEach(item => {
      const fieldName = item.field;
      const domain = item.domain;
      const type = item.type;
      const isMost = item.isMost || false;
      
      // Get the corresponding classic and rationale keys
      const classicKey = fieldName + (fieldName.startsWith("most_") ? "_classic" : "_classic");
      const rationaleKey = fieldName + (fieldName.startsWith("most_") ? "_rationale" : "_rationale");
      
      // Add person if the field exists
      if (dnaAnalysisData[fieldName]) {
        const name = dnaAnalysisData[fieldName];
        const classic = dnaAnalysisData[classicKey] || "";
        
        // Get icon URL from the getIconByName function
        const iconUrl = getIconByName(name) || "";
        
        // Always use icon as primary image source, with Lightning logo as fallback
        const imageUrl = iconUrl || FALLBACK_IMAGE_URL;
        
        // Always include the person with icon illustration (or fallback)
        people.push({
          name,
          classic,
          rationale: dnaAnalysisData[rationaleKey] || "",
          domain,
          type,
          imageUrl,
          iconUrl,
          isMost,
          useIconFallback: true // Always show name overlay since we're using icons
        });
      }
    });

    return people;
  }, [dnaAnalysisData, isLoading, getIconByName]);

  // Handler for when a person card is clicked
  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
    setDialogOpen(true);
  };

  // Handler for dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  // Handler for navigating between people in the dialog
  const handleDialogNavigation = (index: number) => {
    setSelectedPerson(carouselData[index]);
  };

  // Find the index of the selected person in the carousel data
  const selectedPersonIndex = useMemo(() => {
    if (!selectedPerson) return 0;
    return carouselData.findIndex(
      (person) => person.name === selectedPerson.name && person.domain === selectedPerson.domain
    );
  }, [selectedPerson, carouselData]);

  // Set options for better mobile display
  const carouselOptions = {
    align: "start" as const,
    loop: false,
    dragFree: true
  };

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (carouselData.length === 0) {
    return (
      <div className="px-4">
        <p className="text-sm text-[#E9E7E2]/70 font-oxanium text-center">
          No kindred spirits or challenging voices found.
        </p>
      </div>
    );
  }

  return (
    <>
      <Carousel 
        opts={carouselOptions} 
        className="w-full pb-10 overflow-visible"
      >
        <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
          {carouselData.map((person, index) => (
            <CarouselItem 
              key={`${person.domain}_${person.type}_${index}`} 
              className="pl-2 md:pl-4 basis-[57%] md:basis-1/4 lg:basis-1/5"
            >
              <PersonCard
                name={person.name}
                classic={person.classic}
                rationale={person.rationale}
                imageUrl={person.imageUrl}
                domain={person.isMost ? "MOST" : person.domain}
                type={person.type}
                onClick={() => handlePersonClick(person)}
                showNameOverlay={person.isMost || person.useIconFallback}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-2" />
        <CarouselNext className="hidden md:flex -right-2" />
      </Carousel>

      {selectedPerson && (
        <PersonDetailsDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          name={selectedPerson.name}
          classic={selectedPerson.classic}
          rationale={selectedPerson.rationale}
          imageUrl={selectedPerson.imageUrl}
          allPeople={carouselData}
          currentIndex={selectedPersonIndex}
          onNavigate={handleDialogNavigation}
        />
      )}
    </>
  );
};

export default IntellectualCarousel; 