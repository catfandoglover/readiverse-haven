
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContentCard from "./ContentCard";
import GreatQuestionDetailedView from "./GreatQuestionDetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionsContentProps {
  currentIndex: number;
  onDetailedViewShow: () => void;
  onDetailedViewHide: () => void;
}

const QuestionsContent: React.FC<QuestionsContentProps> = ({
  currentIndex,
  onDetailedViewShow,
  onDetailedViewHide,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, slug } = useParams();
  const [detailViewVisible, setDetailViewVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Save current path for proper back navigation - this is critical
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/view/')) {
      // This will store the current feed page as the source path
      saveSourcePath(currentPath);
      console.log('[QuestionsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["discover-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("great_questions")
        .select("*")
        .order("randomizer", { ascending: true })
        .limit(20);

      if (error) {
        console.error("Error fetching questions:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (type === "question" && slug) {
      const loadQuestionDetails = async () => {
        try {
          const { data, error } = await supabase
            .from("great_questions")
            .select("*")
            .eq("id", slug)
            .single();

          if (error) throw error;

          if (data) {
            setSelectedQuestion(data);
            setDetailViewVisible(true);
            onDetailedViewShow();
          }
        } catch (err) {
          console.error("Error loading question details:", err);
          navigate("/discover", { replace: true });
        }
      };

      loadQuestionDetails();
    } else {
      setDetailViewVisible(false);
    }
  }, [type, slug, navigate, onDetailedViewShow]);

  const handleCloseDetailView = () => {
    setDetailViewVisible(false);
    onDetailedViewHide();
    
    const sourcePath = getSourcePath();
    console.log("[QuestionsContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
  };

  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question);
    setDetailViewVisible(true);
    onDetailedViewShow();
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[QuestionsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/question/${question.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath // Pass the exact current path
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#E9E7E2]">No questions found</div>
      </div>
    );
  }

  const currentQuestion = currentIndex < questions.length ? questions[currentIndex] : questions[0];

  return (
    <div className="flex flex-col h-full relative">
      {detailViewVisible && selectedQuestion ? (
        <GreatQuestionDetailedView 
          data={selectedQuestion} 
          onBack={handleCloseDetailView} 
        />
      ) : (
        <ContentCard
          image={currentQuestion.illustration || ''}
          title={currentQuestion.question || 'Great Question'}
          about={currentQuestion.great_conversation || 'Explore this great question...'}
          itemId={currentQuestion.id}
          itemType="question"
          onImageClick={() => handleQuestionSelect(currentQuestion)}
          onLearnMore={() => handleQuestionSelect(currentQuestion)}
          onNext={() => navigate(`/discover/questions/${Math.min(currentIndex + 1, questions.length - 1)}`)}
          onPrevious={() => navigate(`/discover/questions/${Math.max(currentIndex - 1, 0)}`)}
          hasNext={currentIndex < questions.length - 1}
          hasPrevious={currentIndex > 0}
        />
      )}
    </div>
  );
};

export default QuestionsContent;
