
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import GreatQuestionDetailedView from "./GreatQuestionDetailedView";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData, ContentItem } from "@/hooks/useContentData";

interface QuestionsContentProps {
  currentIndex: number;
  onDetailedViewShow: () => void;
  onDetailedViewHide: () => void;
}

const QuestionLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4 pt-16">
    <div className="rounded-lg bg-gray-700 h-64 w-full"></div>
    <div className="h-8 bg-gray-700 rounded w-2/3 mt-4"></div>
    <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-4 bg-gray-700 rounded w-11/12 mt-1"></div>
    <div className="h-4 bg-gray-700 rounded w-4/5 mt-1"></div>
  </div>
);

const QuestionsContent: React.FC<QuestionsContentProps> = ({ 
  currentIndex: initialIndex, 
  onDetailedViewShow, 
  onDetailedViewHide 
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ContentItem | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  // Use our custom hook for data loading
  const { 
    currentItem: questionToShow,
    currentIndex,
    setCurrentIndex,
    items: questions,
    isLoading,
    handleNext,
    handlePrevious,
    hasNext,
    hasPrevious
  } = useContentData({ contentType: 'question' });

  // Update index from props if needed
  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, setCurrentIndex, currentIndex]);

  // Save current path for proper back navigation
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/view/')) {
      // This will store the current feed page as the source path
      saveSourcePath(currentPath);
      console.log('[QuestionsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  // Handle URL-based navigation to detailed view
  useEffect(() => {
    if (location.pathname.includes('/view/question/')) {
      const questionId = location.pathname.split('/view/question/')[1];
      
      if (selectedQuestion?.id !== questionId) {
        const question = questions.find(q => q.id === questionId || q.slug === questionId);
        
        if (question) {
          console.log("Found matching question in list:", question.title || question.question);
          setSelectedQuestion(question);
          if (onDetailedViewShow) onDetailedViewShow();
        }
      }
    } else if (selectedQuestion) {
      setSelectedQuestion(null);
    }
  }, [location.pathname, questions, selectedQuestion, onDetailedViewShow]);

  const handleQuestionSelect = (question: ContentItem) => {
    setSelectedQuestion(question);
    
    // Get the current path before navigation to use it as the source path
    const sourcePath = location.pathname;
    console.log("[QuestionsContent] Setting source path for detail view:", sourcePath);
    
    navigate(`/view/question/${question.id}`, { 
      replace: true,
      state: { 
        fromSection: 'discover',
        sourcePath: sourcePath
      }
    });
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedQuestion(null);
    
    const sourcePath = getSourcePath();
    console.log("[QuestionsContent] Navigating back to:", sourcePath);
    
    navigate(sourcePath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  if (isLoading || !questionToShow) {
    return (
      <div className="h-full">
        <QuestionLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {selectedQuestion ? (
        <GreatQuestionDetailedView 
          data={selectedQuestion} 
          onBack={handleCloseDetailedView} 
        />
      ) : (
        questionToShow && (
          <ContentCard
            image={questionToShow.image || questionToShow.illustration || ''}
            title={questionToShow.title || questionToShow.question || 'Great Question'}
            about={questionToShow.about || questionToShow.great_conversation || 'Explore this great question...'}
            itemId={questionToShow.id}
            itemType="question"
            onImageClick={() => handleQuestionSelect(questionToShow)}
            onLearnMore={() => handleQuestionSelect(questionToShow)}
            onNext={hasNext ? handleNext : undefined}
            onPrevious={hasPrevious ? handlePrevious : undefined}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        )
      )}
    </div>
  );
};

export default QuestionsContent;
