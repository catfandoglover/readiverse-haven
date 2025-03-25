
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContentCard from "./ContentCard";
import GreatQuestionDetailedView from "./GreatQuestionDetailedView";

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

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["discover-questions"],
    queryFn: async () => {
      try {
        console.log("Fetching questions");
        const { data, error } = await supabase
          .from("great_questions")
          .select("*")
          .limit(20);

        if (error) {
          console.error("Error fetching questions:", error);
          throw error;
        }

        console.log("Fetched questions:", data?.length || 0);
        return data || [];
      } catch (err) {
        console.error("Error in question fetch:", err);
        return [];
      }
    },
    staleTime: 60000,
  });

  useEffect(() => {
    // Check if we're on a question detail route
    if (type === "question" && slug) {
      console.log("Loading question details for:", slug);
      const loadQuestionDetails = async () => {
        try {
          const { data, error } = await supabase
            .from("great_questions")
            .select("*")
            .eq("id", slug)
            .single();

          if (error) {
            console.error("Error loading question details:", error);
            throw error;
          }

          console.log("Question details loaded:", data?.question);
          if (data) {
            setSelectedQuestion(data);
            setDetailViewVisible(true);
            onDetailedViewShow();
          } else {
            console.error("No question data found for ID:", slug);
            navigate("/discover", { replace: true });
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

  // Handle navigation back from detailed view
  const handleCloseDetailView = () => {
    setDetailViewVisible(false);
    onDetailedViewHide();
    navigate("/discover", { replace: true });
  };

  // Navigate to question detail
  const handleQuestionSelect = (question: any) => {
    console.log("Selecting question:", question.id, question.question);
    setSelectedQuestion(question);
    setDetailViewVisible(true);
    onDetailedViewShow();
    navigate(`/view/question/${question.id}`, { 
      replace: true,
      state: { fromDiscover: true } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#E9E7E2] animate-pulse">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#E9E7E2]">No questions found. Please try again later.</div>
      </div>
    );
  }

  // Select the current question based on currentIndex
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
