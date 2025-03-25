
import React, { useEffect, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Compass, LibraryBig, Search, Dna } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { QuestionImage } from "@/components/QuestionsCards";
import { NotionSyncButton } from "@/components/NotionSyncButton";
import { AnalyzeDNAButton } from "@/components/AnalyzeDNAButton";
import { saveLastVisited, getLastVisited, saveScrollPosition, getScrollPosition } from "@/utils/navigationHistory";
import GreatQuestionDetailedView from "@/components/discover/GreatQuestionDetailedView";

type Question = Database['public']['Tables']['great_questions']['Row'];

const categories = [
  'AESTHETICS',
  'EPISTEMOLOGY',
  'ETHICS',
  'ONTOLOGY',
  'POLITICS',
  'THEOLOGY'
] as const;

const getCategorySubheader = (category: string) => {
  const subheaders: Record<string, string> = {
    'AESTHETICS': 'QUESTION BEAUTY',
    'EPISTEMOLOGY': 'QUESTION KNOWLEDGE',
    'ETHICS': 'QUESTION THE GOOD',
    'ONTOLOGY': 'QUESTION REALITY',
    'POLITICS': 'QUESTION POWER',
    'THEOLOGY': 'QUESTION THE DIVINE'
  };
  return subheaders[category];
};

const CategoryQuestions = ({ category, questions, onQuestionClick }: { 
  category: string, 
  questions: Question[],
  onQuestionClick: (question: Question) => void
}) => {
  const navigate = useNavigate();
  
  if (!questions.length) return null;

  return (
    <div className="space-y-6 mb-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase">
          {category}
        </h2>
        <p className="text-sm font-oxanium text-center text-[#75869660] uppercase">
          {getCategorySubheader(category)}
        </p>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-4 min-w-min">
          {questions.map((question) => (
            <Card 
              key={question.id}
              className="flex-none w-[85vw] md:w-[400px] overflow-hidden border-0 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1A1F2C 0%, #7E69AB 100%)'
              }}
              onClick={() => onQuestionClick(question)}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1 mb-4">
                  <h3 className="text-base md:text-lg font-baskervville text-[#E9E7E2] text-center line-clamp-3">
                    {question.question}
                  </h3>
                </div>
                
                <div className="bg-[#2A282A]/30 backdrop-blur-sm rounded-lg p-4">
                  <div className="aspect-[4/3] relative overflow-hidden rounded-md">
                    <QuestionImage 
                      src={question.illustration} 
                      alt={`Illustration for "${question.question}"`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const GreatQuestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = getScrollPosition(location.pathname);
    if (savedPosition && savedPosition > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'instant'
        });
      });
    }
  }, [location.pathname]);

  const { data: questions, isLoading: areQuestionsLoading } = useQuery({
    queryKey: ['all-questions'],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('great_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      return questionsData as Question[];
    }
  });

  const fetchQuestionById = useCallback(async (questionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('great_questions')
        .select('*')
        .eq('id', questionId)
        .single();
        
      if (error) {
        console.error('Error fetching question details:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error in question fetch:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadQuestionDetails = async () => {
      if (id) {
        const question = await fetchQuestionById(id);
        if (question) {
          setSelectedQuestion(question);
        } else {
          // If question not found, redirect to questions list
          navigate('/great-questions', { replace: true });
        }
      } else {
        setSelectedQuestion(null);
      }
    };

    loadQuestionDetails();
  }, [id, fetchQuestionById, navigate]);

  useEffect(() => {
    saveLastVisited('discover', location.pathname);

    if (isInitialMount) {
      restoreScrollPosition();
      setIsInitialMount(false);
    }

    const handleScroll = () => {
      if (!isInitialMount) {
        const currentPosition = window.scrollY;
        if (currentPosition > 0) {
          saveScrollPosition(location.pathname, currentPosition);
        }
      }
    };

    const debouncedHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    return () => {
      handleScroll();
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [location.pathname, isInitialMount, restoreScrollPosition]);

  const handleNavigation = (path: string) => {
    const currentPosition = window.scrollY;
    if (currentPosition > 0) {
      saveScrollPosition(location.pathname, currentPosition);
    }

    if (path === '/' && location.pathname !== '/') {
      navigate('/');
    } else if (path === '/dna') {
      navigate(getLastVisited('dna'));
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf'));
    } else {
      navigate(path);
    }
  };

  const handleCloseDetailView = () => {
    setSelectedQuestion(null);
    navigate('/great-questions');
  };

  const handleQuestionClick = (question: Question) => {
    navigate(`/great-questions/${question.id}`, { 
      state: { fromSection: 'discover' }
    });
  };

  const isCurrentSection = (path: string) => {
    if (path === '/dna') {
      return location.pathname.startsWith('/dna');
    }
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/great-questions');
    }
    if (path === '/bookshelf') {
      return location.pathname.startsWith('/bookshelf');
    }
    return false;
  };

  // Show individual question view
  if (id && (selectedQuestion || isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-white animate-pulse">Loading question details...</div>
          </div>
        ) : selectedQuestion ? (
          <GreatQuestionDetailedView 
            data={selectedQuestion} 
            onBack={handleCloseDetailView} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-white mb-4">Question not found</div>
            <button 
              onClick={() => navigate('/great-questions')}
              className="px-4 py-2 bg-[#2A282A] text-white rounded-md hover:bg-[#2A282A]/80"
            >
              Back to Questions
            </button>
          </div>
        )}
      </div>
    );
  }

  if (areQuestionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-background">
        <div className="animate-pulse text-foreground">Loading questions...</div>
      </div>
    );
  }

  const questionsByCategory = categories.reduce((acc, category) => {
    acc[category] = (questions || []).filter(q => q.category === category);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-3 sticky top-0 z-10 bg-background">
        <div className="flex justify-between items-center">
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>*]:relative [&>*]:z-[1]"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <AnalyzeDNAButton />
            <NotionSyncButton />
          </div>
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-foreground hover:bg-white/10 transition-all duration-200"
            onClick={() => handleNavigation('/search')}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-4 pb-[60px]">
        <h1 className="text-2xl font-oxanium text-center text-foreground mb-12 uppercase">
          The Great Questions
        </h1>
        
        {categories.map(category => (
          <CategoryQuestions 
            key={category} 
            category={category} 
            questions={questionsByCategory[category] || []} 
            onQuestionClick={handleQuestionClick}
          />
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background py-2 z-50">
        <div className="flex justify-between items-center max-w-sm mx-auto px-8">
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/dna') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/dna')}
          >
            <Dna className="h-6 w-6" />
            <span className="text-xs font-oxanium">My DNA</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs font-oxanium">Discover</span>
          </button>
          <button 
            className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-foreground hover:bg-white/10 transition-all duration-200 ${isCurrentSection('/bookshelf') ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]' : ''}`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <LibraryBig className="h-6 w-6" />
            <span className="text-xs font-oxanium">Bookshelf</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default GreatQuestions;
