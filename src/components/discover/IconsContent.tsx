import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/use-toast";
import { capitalizeFirstLetter } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Icon {
  id: string;
  name: string;
  description: string;
  illustration: string;
  domain_id: string;
  created_at: string;
}

interface Domain {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const IconsContent: React.FC = () => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchDomainAndIcons(slug);
    }
  }, [slug]);

  const fetchDomainAndIcons = async (domainSlug: string) => {
    try {
      // Fetch the domain based on the slug
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select('*')
        .eq('id', domainSlug)
        .single();

      if (domainError) {
        console.error("Error fetching domain:", domainError);
        toast({
          title: "Error",
          description: "Failed to load domain details.",
          variant: "destructive",
        });
        return;
      }

      if (!domainData) {
        console.log("Domain not found");
        toast({
          title: "Not Found",
          description: "Domain not found.",
          variant: "destructive",
        });
        navigate('/discover');
        return;
      }

      setDomain(domainData);

      // Fetch icons related to the domain
      const { data: iconsData, error: iconsError } = await supabase
        .from('icons')
        .select('*')
        .eq('domain_id', domainSlug);

      if (iconsError) {
        console.error("Error fetching icons:", iconsError);
        toast({
          title: "Error",
          description: "Failed to load icons for this domain.",
          variant: "destructive",
        });
        return;
      }

      if (iconsData) {
        setIcons(iconsData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const goToPreviousIcon = () => {
    setCurrentIconIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : icons.length - 1
    );
  };

  const goToNextIcon = () => {
    setCurrentIconIndex((prevIndex) =>
      prevIndex < icons.length - 1 ? prevIndex + 1 : 0
    );
  };

  const currentIcon = icons[currentIconIndex];

  return (
    <div className="container py-12">
      {domain ? (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
            {capitalizeFirstLetter(domain.name)}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {domain.description}
          </p>
        </div>
      ) : (
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400">Loading domain details...</p>
        </div>
      )}

      {currentIcon ? (
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:order-1">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={currentIcon.illustration}
                    alt={currentIcon.name}
                    className="object-cover rounded-md"
                  />
                </AspectRatio>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {capitalizeFirstLetter(currentIcon.name)}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {currentIcon.description}
                </p>
                <div className="flex justify-between">
                  <Button variant="outline" size="icon" onClick={goToPreviousIcon}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextIcon}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No icons available for this domain.</p>
        </div>
      )}
    </div>
  );
};

export default IconsContent;
