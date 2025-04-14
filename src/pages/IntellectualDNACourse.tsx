import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Lock, ArrowRight, Hexagon, SlidersHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useCourses } from "@/hooks/useCourses";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  [key: string]: string | null;
}

interface MatchedEntity {
  dna_analysis_column: string;
  matched_id: string;
  type: 'icon' | 'book';
  matched_name: string;
}

interface FetchedIcon {
  id: string;
  name: string;
  illustration: string | null;
  one_line: string | null;
}

interface FetchedBook {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
}

interface Resource {
  id: string;
  matched_id: string | null;
  type: 'icon' | 'book' | null;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
}

// Add type for the specific table row
interface DnaAnalysisResultsMatchedRow {
  dna_analysis_column: string;
  matched_id: string;
  type: 'icon' | 'book';
  matched_name: string | null; // Allow null based on DB schema
}

const IntellectualDNACourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCourse } = useCourses();
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [domainAnalysis, setDomainAnalysis] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCourseId, setIsCreatingCourseId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const [matchedEntitiesMap, setMatchedEntitiesMap] = useState<Record<string, MatchedEntity>>({});
  const [fetchedIcons, setFetchedIcons] = useState<Record<string, FetchedIcon>>({});
  const [fetchedBooks, setFetchedBooks] = useState<Record<string, FetchedBook>>({});
  
  const domains = [
    {
      id: "ethics",
      title: "ETHICS",
      subtitle: "Your view on the Good.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#1D3A35"
    },
    {
      id: "theology",
      title: "THEOLOGY",
      subtitle: "Your view on the divine.",
      description: "Seeks experiential knowledge while maintaining rational frameworks.",
      color: "#1D3A35"
    },
    {
      id: "epistemology",
      title: "EPISTEMOLOGY",
      subtitle: "Your view on Knowledge",
      description: "Examines the nature and grounds of knowledge.",
      color: "#1D3A35"
    },
    {
      id: "ontology",
      title: "ONTOLOGY",
      subtitle: "Your view on Reality",
      description: "Explores the nature of being and existence.",
      color: "#1D3A35"
    },
    {
      id: "politics",
      title: "POLITICS",
      subtitle: "Your view on Society",
      description: "Examines the organization and governance of communities.",
      color: "#1D3A35"
    },
    {
      id: "aesthetics",
      title: "AESTHETICS",
      subtitle: "Your view on Beauty",
      description: "Explores the nature of beauty, art, and taste.",
      color: "#1D3A35"
    }
  ];
  
  const filteredDomains = domainFilter && domainFilter !== "all" 
    ? domains.filter(domain => domain.id === domainFilter)
    : domains;
    
  useEffect(() => {
    const debug: any = { steps: [] };
    
    const fetchAllData = async () => {
      if (!user) {
        setDebugInfo({ error: "No authenticated user" });
        setIsLoading(false);
        return;
      }
      
      let fetchedAnalysis: DNAAnalysisResult | null = null;
      
      try {
        setIsLoading(true);
        setDomainAnalysis(null);
        setMatchedEntitiesMap({});
        setFetchedIcons({});
        setFetchedBooks({});
        
        debug.steps.push({ step: 1, description: "Finding user profile", userId: user.id });
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (profileError || !profile) {
           setDebugInfo({ error: profileError?.message || "No profile found for user", userId: user.id });
          throw new Error(profileError?.message || "No profile found for user");
        }
        debug.steps.push({ step: 2, description: "Found user profile", profileId: profile.id, success: true });

        if (!profile.assessment_id) {
          setDebugInfo({ error: "Profile has no assessment_id", profile });
          throw new Error("Profile doesn't have an assessment_id");
        }
        const assessmentId = profile.assessment_id;
        debug.steps.push({ step: 3, description: "Got assessment_id from profile", assessmentId: assessmentId, success: true });

        debug.steps.push({ step: 4, description: "Fetching DNA analysis results", assessmentId: assessmentId });
        const { data: dnaData, error: dnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', assessmentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (dnaError) {
           setDebugInfo({ error: `DNA Fetch Error: ${dnaError.message}`, assessmentId });
           throw new Error(`Error fetching DNA analysis: ${dnaError.message}`);
        }
        if (!dnaData) {
            setDebugInfo({ error: "No DNA analysis data found for assessment ID", assessmentId });
            throw new Error(`No DNA analysis data found for assessment ID: ${assessmentId}`);
        }
        fetchedAnalysis = dnaData as DNAAnalysisResult;
        setDomainAnalysis(fetchedAnalysis);
        debug.steps.push({ step: 5, description: "Fetched DNA analysis results", dnaId: fetchedAnalysis.id, success: true });

        debug.steps.push({ step: 6, description: "Fetching matched entities", assessmentId: assessmentId });
        const { data: matchedDataRaw, error: matchedError } = await supabase
          .from('dna_analysis_results_matched' as any)
          .select('dna_analysis_column, matched_id, type, matched_name')
          .eq('assessment_id', assessmentId);
        
        if (matchedError) {
          toast.warning("Could not load matched entity links. Some items may be incorrect.");
          console.error("Error fetching matched entities:", matchedError);
          debug.steps.push({ step: 7, description: "Error fetching matched entities", error: matchedError.message, success: false });
        } else if (matchedDataRaw) {
          const entityMap: Record<string, MatchedEntity> = {};
          const iconIds = new Set<string>();
          const bookIds = new Set<string>();
          
          const matchedData = matchedDataRaw as any as DnaAnalysisResultsMatchedRow[];
          
          matchedData.forEach((item) => {
            if (item.dna_analysis_column && item.matched_id && item.type) {
              entityMap[item.dna_analysis_column] = {
                dna_analysis_column: item.dna_analysis_column,
                matched_id: item.matched_id,
                type: item.type as 'icon' | 'book',
                matched_name: item.matched_name || 'Unknown Name'
              };
              if (item.type === 'icon') iconIds.add(item.matched_id);
              if (item.type === 'book') bookIds.add(item.matched_id);
            }
          });
          
          setMatchedEntitiesMap(entityMap);
          debug.steps.push({ step: 7, description: "Processed matched entities", count: matchedData.length, mapSize: Object.keys(entityMap).length, success: true });
          
          if (iconIds.size > 0) {
            debug.steps.push({ step: 8, description: "Fetching icon details", ids: Array.from(iconIds) });
            const { data: iconDataRaw, error: iconError } = await supabase
              .from('icons')
              .select('id, name, illustration, one_line')
              .in('id', Array.from(iconIds));
              
            if (iconError) {
               toast.warning("Could not load icon details.");
               console.error("Error fetching icons:", iconError);
               debug.steps.push({ step: 9, description: "Error fetching icon details", error: iconError.message, success: false });
            } else if (iconDataRaw) {
               const iconData = iconDataRaw as any as FetchedIcon[];
               const iconMap: Record<string, FetchedIcon> = {};
               iconData.forEach(icon => { iconMap[icon.id] = icon; });
               setFetchedIcons(iconMap);
               debug.steps.push({ step: 9, description: "Fetched icon details", count: iconData.length, success: true });
            }
          } else {
             debug.steps.push({ step: 8, description: "No icon IDs to fetch", success: true });
             debug.steps.push({ step: 9, description: "Skipped fetching icon details", success: true });
          }

          if (bookIds.size > 0) {
            debug.steps.push({ step: 10, description: "Fetching book details", ids: Array.from(bookIds) });
            const { data: bookDataRaw, error: bookError } = await supabase
              .from('books')
              .select('id, title, author, cover_url')
              .in('id', Array.from(bookIds));
              
            if (bookError) {
               toast.warning("Could not load book details.");
               console.error("Error fetching books:", bookError);
               debug.steps.push({ step: 11, description: "Error fetching book details", error: bookError.message, success: false });
            } else if (bookDataRaw) {
               const bookData = bookDataRaw as any as FetchedBook[];
               const bookMap: Record<string, FetchedBook> = {};
               bookData.forEach(book => { bookMap[book.id] = book; });
               setFetchedBooks(bookMap);
               debug.steps.push({ step: 11, description: "Fetched book details", count: bookData.length, success: true });
            }
          } else {
            debug.steps.push({ step: 10, description: "No book IDs to fetch", success: true });
            debug.steps.push({ step: 11, description: "Skipped fetching book details", success: true });
          }
        } else {
           debug.steps.push({ step: 7, description: "No matched entities found", success: true });
           debug.steps.push({ step: 8, description: "Skipped fetching icon details", success: true });
           debug.steps.push({ step: 9, description: "Skipped fetching icon details", success: true });
           debug.steps.push({ step: 10, description: "Skipped fetching book details", success: true });
           debug.steps.push({ step: 11, description: "Skipped fetching book details", success: true });
        }
        
        debug.success = true;
      } catch (err) {
        console.error('Error in DNA course data fetch:', err);
        setDomainAnalysis(null);
        setMatchedEntitiesMap({});
        setFetchedIcons({});
        setFetchedBooks({});
        setDebugInfo({
          ...debug,
          error: err instanceof Error ? err.message : String(err),
          success: false
        });
        toast.error("Failed to load your DNA course data.");
      } finally {
        setIsLoading(false);
        setDebugInfo(debug);
      }
    };
    
    fetchAllData();
  }, [user]);
  
  const getDomainIntroduction = (domainId: string) => {
    if (isLoading) {
      return "Loading domain introduction...";
    }
    
    if (!domainAnalysis) {
      return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
    
    switch (domainId) {
      case "theology":
        return domainAnalysis.theology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ontology":
        return domainAnalysis.ontology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "epistemology":
        return domainAnalysis.epistemology_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "ethics":
        return domainAnalysis.ethics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "politics":
        return domainAnalysis.politics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      case "aesthetics":
        return domainAnalysis.aesthetics_introduction || "Seeks experiential knowledge while maintaining rational frameworks.";
      default:
        return "Seeks experiential knowledge while maintaining rational frameworks.";
    }
  };
  
  const getResourcesForTab = useCallback((domainId: string, tab: "kindred" | "challenging"): Resource[] => {
    if (isLoading || !domainAnalysis) {
      return Array(5).fill(null).map((_, i) => ({
        id: `loading-${domainId}-${tab}-${i}`,
        matched_id: null,
        type: null,
        image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
        title: "Loading...",
        subtitle: "Loading...",
        description: "Loading...",
        status: "locked"
      }));
    }
    
    const resources: Resource[] = [];
    
    for (let i = 1; i <= 5; i++) {
      let analysisThinkerNameKey = '';
      let analysisClassicKey = '';
      let analysisRationaleKey = '';
      
      if (tab === "kindred") {
        analysisThinkerNameKey = `${domainId}_kindred_spirit_${i}`;
        analysisClassicKey = `${domainId}_kindred_spirit_${i}_classic`;
        analysisRationaleKey = `${domainId}_kindred_spirit_${i}_rationale`;
      } else {
        analysisThinkerNameKey = `${domainId}_challenging_voice_${i}`;
        analysisClassicKey = `${domainId}_challenging_voice_${i}_classic`;
        analysisRationaleKey = `${domainId}_challenging_voice_${i}_rationale`;
      }

      const matchedEntity = matchedEntitiesMap[analysisThinkerNameKey];
      const matchedClassicEntity = matchedEntitiesMap[analysisClassicKey];

      let title = domainAnalysis[analysisThinkerNameKey] || `Thinker ${i}`;
      let subtitle = domainAnalysis[analysisClassicKey] || `Classic Work`;
      let image = "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
      let matched_id: string | null = null;
      let type: 'icon' | 'book' | null = null;

      if (matchedEntity) {
        matched_id = matchedEntity.matched_id;
        type = matchedEntity.type;
        
        if (type === 'icon' && fetchedIcons[matched_id]) {
          const icon = fetchedIcons[matched_id];
          title = icon.name;
          image = icon.illustration || image;
        } else if (type === 'book' && fetchedBooks[matched_id]) {
          const book = fetchedBooks[matched_id];
          title = book.title;
          image = book.cover_url || image;
          subtitle = book.author || subtitle;
        } else {
           title = matchedEntity.matched_name || title;
           if (type) {
               toast.warning(`Details missing for ${type} ${title}`);
           }
        }
      } else {
         console.warn(`No matched entity found for column: ${analysisThinkerNameKey}`);
         title = domainAnalysis[analysisThinkerNameKey] || `Unlinked Thinker ${i}`;
      }

      if (matchedClassicEntity && matchedClassicEntity.type === 'book' && fetchedBooks[matchedClassicEntity.matched_id]) {
         const classicBook = fetchedBooks[matchedClassicEntity.matched_id];
         subtitle = classicBook.title || subtitle;
         if (classicBook.author) {
            subtitle += ` (${classicBook.author})`;
         }
      } else {
         subtitle = domainAnalysis[analysisClassicKey] || subtitle;
      }
      
      const rationale = domainAnalysis[analysisRationaleKey];
      
      let status = "locked";
      if (i === 1) status = "completed";
      else if (i === 2) status = "active";
      else status = "locked";
      
      resources.push({
        id: matched_id || `fallback-${domainId}-${tab}-${i}`,
        matched_id,
        type,
        image,
        title: String(title).toUpperCase(),
        subtitle: String(subtitle),
        description: rationale ? String(rationale) : `This ${type || 'entry'} ${tab === "kindred" ? "aligns with" : "challenges"} your ${domainId} perspective.`,
        status
      });
    }
    
    return resources;
  }, [isLoading, domainAnalysis, matchedEntitiesMap, fetchedIcons, fetchedBooks]);

  const handleResourceClick = async (resource: Resource) => {
    if (resource.matched_id && resource.type && !isCreatingCourseId) {
      setIsCreatingCourseId(resource.id);
      try {
        console.log(`Attempting to create course for ${resource.type}: ${resource.matched_id}`);
        const result = await createCourse(resource.matched_id);
        console.log("Create course result:", result);

        if (result.success || result.duplicate) {
          navigate(`/courses/${resource.matched_id}`, {
            state: {
              courseData: {
                entryId: resource.matched_id,
                entryType: resource.type,
                title: resource.title,
                description: resource.description,
              }
            }
          });
        } else {
          console.error("Failed to create course via hook.");
        }
      } catch (error) {
        console.error("Error creating or navigating to course:", error);
        toast.error("Failed to start the course session.");
      } finally {
        setIsCreatingCourseId(null);
      }
    } else if (!resource.matched_id || !resource.type) {
      toast.info("This item is not yet linked to a course.");
      console.warn("Clicked resource has no matched_id or type:", resource);
    }
  };

  const ResourceItem = ({ resource, domainId }: { resource: Resource, domainId: string }) => {
    const hasData = !!resource.matched_id && !!resource.type;
    const isClickable = hasData;
    const isLoadingThis = isCreatingCourseId === resource.id;

    return (
      <div
        className={cn(
          "flex items-center p-4 mb-4 rounded-xl bg-[#19352F]/80 transition-colors",
          isClickable && !isLoadingThis && "hover:bg-[#19352F] cursor-pointer",
          isLoadingThis && "opacity-70 cursor-wait",
          !isClickable && !isLoadingThis && "opacity-50 cursor-default"
        )}
        onClick={isClickable && !isLoadingThis ? () => handleResourceClick(resource) : undefined}
        aria-label={resource.title}
      >
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-[#E9E7E2] font-baskerville text-base truncate">
            {resource.title}
          </h3>
          <p className="text-[#E9E7E2]/70 text-sm truncate mt-0.5">
            {resource.subtitle}
          </p>
        </div>

        {(resource.type === 'book' && resource.image) ? (
          <div className="flex-shrink-0 h-16 w-12 rounded-sm overflow-hidden bg-[#0D1C1A]">
            <img 
              src={resource.image} 
              alt={resource.title || 'Book cover'} 
              className="h-full w-full object-cover"
              loading="lazy" 
            />
          </div>
        ) : (resource.type === 'icon' && resource.image) ? (
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Hexagon className="h-full w-full text-[#356E61]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={resource.image} 
                alt={resource.title || 'Illustration'} 
                className="h-8 w-8 object-cover"
                style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
                loading="lazy" 
              />
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-[#0D1C1A] rounded-md">
            <ArrowRight className="h-6 w-6 text-[#356E61]"/>
          </div>
        )}
      </div>
    );
  };
  
  const DomainSection = ({ domain }: { domain: any }) => {
    const [activeTab, setActiveTab] = useState<"kindred" | "challenging">("kindred");
    const kindredResources = getResourcesForTab(domain.id, "kindred");
    const challengingResources = getResourcesForTab(domain.id, "challenging");
    const resources = activeTab === "kindred" ? kindredResources : challengingResources;
    
    return (
      <div id={`domain-${domain.id}`} className="min-h-screen pt-6 pb-10" style={{ backgroundColor: domain.color }}>
        <div className="px-6">
          <h1 className="font-libre-baskerville font-bold uppercase text-[#E9E7E2] text-base mb-1">{domain.title}</h1>
          <p className="font-baskerville text-[#E9E7E2] mb-4 opacity-[0.35] text-lg">{domain.subtitle}</p>
          <p className="font-oxanium text-[#E9E7E2] opacity-[0.5] mb-10">
            {getDomainIntroduction(domain.id)}
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
                activeTab === "kindred" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => setActiveTab("kindred")}
            >
              <span className={cn(
                "relative",
                activeTab === "kindred" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                KINDRED SPIRITS
              </span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
                activeTab === "challenging" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => setActiveTab("challenging")}
            >
              <span className={cn(
                "relative",
                activeTab === "challenging" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
              )}>
                CHALLENGING VOICES
              </span>
            </Button>
          </div>
          
          <div className="space-y-4">
            {resources.map((resource) => (
              <ResourceItem key={resource.id} resource={resource} domainId={domain.id} />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#1D3A35] text-[#E9E7E2] relative">
      <header className="sticky top-0 z-10 flex items-center pt-4 px-4 bg-[#1D3A35] text-[#E9E7E2]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          INTELLECTUAL DNA COURSE
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none">
              <SlidersHorizontal className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1D3A35] border-[#356E61] text-[#E9E7E2]">
            <DropdownMenuItem 
              onClick={() => setDomainFilter("all")}
              className="flex items-center cursor-pointer font-libre-baskerville uppercase"
            >
              {domainFilter === "all" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <div className="w-4 mr-2" />
              )}
              ALL DOMAINS
            </DropdownMenuItem>
            
            {domains.map(domain => (
              <DropdownMenuItem 
                key={domain.id} 
                onClick={() => setDomainFilter(domain.id)}
                className="flex items-center cursor-pointer font-libre-baskerville uppercase"
              >
                {domainFilter === domain.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <div className="w-4 mr-2" />
                )}
                {domain.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      <main>
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center pt-20 bg-[#1D3A35]/50 z-20">
            {/* Optional: Add a spinner or loading text here */}
            <p>Loading DNA Course...</p>
          </div>
        )}
        {!isLoading && !domainAnalysis && (
          <div className="p-6 text-center">
            <p>Your Intellectual DNA Analysis is not yet available. Please complete the assessment or check back later.</p>
          </div>
        )}
        {!isLoading && domainAnalysis && (
          filteredDomains.length > 0 ? (
            filteredDomains.map(domain => (
              <DomainSection key={domain.id} domain={domain} />
            ))
          ) : (
            <div className="p-6 text-center">
              <p>No domains match your filter criteria.</p>
            </div>
          )
        )}
      </main>
      
      {process.env.NODE_ENV === 'development' && Object.keys(debugInfo).length > 0 && (
        <details className="p-4 m-6 bg-gray-800/50 rounded text-xs text-gray-300 max-w-full overflow-x-auto">
           <summary className="cursor-pointer font-bold mb-2">Debug Info</summary>
           <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

export default IntellectualDNACourse;
